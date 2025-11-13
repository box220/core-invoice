/**
 * Advanced Logging System for Invoice Generator
 *
 * Features:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR)
 * - Persistent storage in localStorage
 * - Export logs to file
 * - Performance tracking
 * - Error tracking with stack traces
 * - User action tracking
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stackTrace?: string;
  userAction?: string;
  performanceMetric?: {
    duration: number;
    operation: string;
  };
}

class Logger {
  private static instance: Logger;
  private readonly STORAGE_KEY = 'invoice_app_logs';
  private readonly MAX_LOGS = 1000; // Keep last 1000 logs
  private enabled: boolean = true;
  private minLevel: LogLevel = LogLevel.DEBUG;

  private constructor() {
    this.loadSettings();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private loadSettings(): void {
    const settings = localStorage.getItem('logger_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.enabled = parsed.enabled ?? true;
      this.minLevel = parsed.minLevel ?? LogLevel.DEBUG;
    }
  }

  private saveSettings(): void {
    localStorage.setItem('logger_settings', JSON.stringify({
      enabled: this.enabled,
      minLevel: this.minLevel
    }));
  }

  configure(enabled: boolean, minLevel: LogLevel): void {
    this.enabled = enabled;
    this.minLevel = minLevel;
    this.saveSettings();
    this.info('Logger', 'Logger configuration updated', { enabled, minLevel });
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;

    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    stackTrace?: string,
    userAction?: string,
    performanceMetric?: { duration: number; operation: string }
  ): LogEntry {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      stackTrace,
      userAction,
      performanceMetric
    };
  }

  private persistLog(entry: LogEntry): void {
    try {
      const logs = this.getLogs();
      logs.push(entry);

      // Keep only the last MAX_LOGS entries
      if (logs.length > this.MAX_LOGS) {
        logs.splice(0, logs.length - this.MAX_LOGS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));

      // Console output for development
      if (import.meta.env.MODE === 'development') {
        const consoleMethod = this.getConsoleMethod(entry.level);
        consoleMethod(
          `[${entry.timestamp}] [${entry.level}] [${entry.category}] ${entry.message}`,
          entry.data || ''
        );
      }
    } catch (error) {
      console.error('Failed to persist log:', error);
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.ERROR:
        return console.error;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.DEBUG:
      default:
        return console.log;
    }
  }

  debug(category: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const entry = this.createLogEntry(LogLevel.DEBUG, category, message, data);
    this.persistLog(entry);
  }

  info(category: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const entry = this.createLogEntry(LogLevel.INFO, category, message, data);
    this.persistLog(entry);
  }

  warn(category: string, message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const entry = this.createLogEntry(LogLevel.WARN, category, message, data);
    this.persistLog(entry);
  }

  error(category: string, message: string, error?: Error | any, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    let stackTrace: string | undefined;
    if (error instanceof Error) {
      stackTrace = error.stack;
      data = { ...data, errorMessage: error.message, errorName: error.name };
    }

    const entry = this.createLogEntry(
      LogLevel.ERROR,
      category,
      message,
      data,
      stackTrace
    );
    this.persistLog(entry);
  }

  logUserAction(action: string, category: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const entry = this.createLogEntry(
      LogLevel.INFO,
      category,
      `User action: ${action}`,
      data,
      undefined,
      action
    );
    this.persistLog(entry);
  }

  logPerformance(operation: string, duration: number, category: string, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const entry = this.createLogEntry(
      LogLevel.DEBUG,
      category,
      `Performance: ${operation} took ${duration}ms`,
      data,
      undefined,
      undefined,
      { operation, duration }
    );
    this.persistLog(entry);
  }

  // Performance tracking helper
  async trackPerformance<T>(
    operation: string,
    category: string,
    fn: () => Promise<T> | T,
    data?: any
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.logPerformance(operation, duration, category, data);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.error(category, `${operation} failed after ${duration}ms`, error, data);
      throw error;
    }
  }

  getLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to load logs:', error);
      return [];
    }
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.getLogs().filter(log => log.level === level);
  }

  getLogsByCategory(category: string): LogEntry[] {
    return this.getLogs().filter(log => log.category === category);
  }

  getLogsByTimeRange(startTime: string, endTime: string): LogEntry[] {
    return this.getLogs().filter(log =>
      log.timestamp >= startTime && log.timestamp <= endTime
    );
  }

  searchLogs(query: string): LogEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getLogs().filter(log =>
      log.message.toLowerCase().includes(lowerQuery) ||
      log.category.toLowerCase().includes(lowerQuery) ||
      JSON.stringify(log.data || {}).toLowerCase().includes(lowerQuery)
    );
  }

  clearLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.info('Logger', 'All logs cleared');
  }

  exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  exportLogsAsFile(filename?: string): void {
    const logs = this.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `invoice-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.info('Logger', 'Logs exported to file', { filename });
  }

  getStatistics(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<string, number>;
    errors: number;
    warnings: number;
    averagePerformance: Record<string, number>;
  } {
    const logs = this.getLogs();

    const stats = {
      total: logs.length,
      byLevel: {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0
      },
      byCategory: {} as Record<string, number>,
      errors: 0,
      warnings: 0,
      averagePerformance: {} as Record<string, number>
    };

    const performanceMetrics: Record<string, number[]> = {};

    logs.forEach(log => {
      stats.byLevel[log.level]++;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;

      if (log.level === LogLevel.ERROR) stats.errors++;
      if (log.level === LogLevel.WARN) stats.warnings++;

      if (log.performanceMetric) {
        const operation = log.performanceMetric.operation;
        if (!performanceMetrics[operation]) {
          performanceMetrics[operation] = [];
        }
        performanceMetrics[operation].push(log.performanceMetric.duration);
      }
    });

    // Calculate average performance
    Object.entries(performanceMetrics).forEach(([operation, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      stats.averagePerformance[operation] = Math.round(avg * 100) / 100;
    });

    return stats;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const log = {
  debug: (category: string, message: string, data?: any) =>
    logger.debug(category, message, data),

  info: (category: string, message: string, data?: any) =>
    logger.info(category, message, data),

  warn: (category: string, message: string, data?: any) =>
    logger.warn(category, message, data),

  error: (category: string, message: string, error?: Error | any, data?: any) =>
    logger.error(category, message, error, data),

  userAction: (action: string, category: string, data?: any) =>
    logger.logUserAction(action, category, data),

  performance: (operation: string, duration: number, category: string, data?: any) =>
    logger.logPerformance(operation, duration, category, data),

  track: <T>(operation: string, category: string, fn: () => Promise<T> | T, data?: any) =>
    logger.trackPerformance(operation, category, fn, data)
};

// Categories for better organization
export const LogCategory = {
  APP: 'App',
  INVOICE: 'Invoice',
  TEMPLATE: 'Template',
  PDF: 'PDF',
  STORAGE: 'Storage',
  EDITOR: 'Editor',
  UI: 'UI',
  PERFORMANCE: 'Performance',
  ERROR: 'Error'
} as const;
