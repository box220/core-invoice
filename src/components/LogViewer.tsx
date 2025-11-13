import React, { useState, useEffect } from 'react';
import { logger, LogEntry, LogLevel } from '../utils/logger';
import { Search, Download, Trash2, RefreshCw, BarChart3 } from 'lucide-react';

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showStats, setShowStats] = useState(false);

  const loadLogs = () => {
    const allLogs = logger.getLogs().reverse(); // Most recent first
    setLogs(allLogs);
    applyFilters(allLogs, searchQuery, levelFilter, categoryFilter);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const applyFilters = (
    logsList: LogEntry[],
    search: string,
    level: LogLevel | 'ALL',
    category: string
  ) => {
    let filtered = logsList;

    if (search) {
      filtered = logger.searchLogs(search).reverse();
    }

    if (level !== 'ALL') {
      filtered = filtered.filter(log => log.level === level);
    }

    if (category !== 'ALL') {
      filtered = filtered.filter(log => log.category === category);
    }

    setFilteredLogs(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(logs, query, levelFilter, categoryFilter);
  };

  const handleLevelFilter = (level: LogLevel | 'ALL') => {
    setLevelFilter(level);
    applyFilters(logs, searchQuery, level, categoryFilter);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    applyFilters(logs, searchQuery, levelFilter, category);
  };

  const handleExport = () => {
    logger.exportLogsAsFile();
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      logger.clearLogs();
      loadLogs();
    }
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return 'text-red-600 bg-red-50';
      case LogLevel.WARN:
        return 'text-yellow-600 bg-yellow-50';
      case LogLevel.INFO:
        return 'text-blue-600 bg-blue-50';
      case LogLevel.DEBUG:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const categories = Array.from(new Set(logs.map(log => log.category)));
  const stats = logger.getStatistics();

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <BarChart3 size={18} />
              {showStats ? 'Hide' : 'Show'} Stats
            </button>
            <button
              onClick={loadLogs}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={18} />
              Clear
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <select
            value={levelFilter}
            onChange={(e) => handleLevelFilter(e.target.value as LogLevel | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Levels</option>
            <option value={LogLevel.ERROR}>Errors</option>
            <option value={LogLevel.WARN}>Warnings</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.DEBUG}>Debug</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics */}
      {showStats && (
        <div className="border-b p-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-red-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-yellow-600">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-sm text-blue-600">Info</p>
              <p className="text-2xl font-bold text-blue-600">{stats.byLevel[LogLevel.INFO]}</p>
            </div>
          </div>

          {Object.keys(stats.averagePerformance).length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Average Performance</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(stats.averagePerformance).map(([operation, avgTime]) => (
                  <div key={operation} className="bg-white p-2 rounded border text-sm">
                    <span className="text-gray-600">{operation}:</span>{' '}
                    <span className="font-semibold">{avgTime}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No logs found</p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <LogEntryCard key={log.id} log={log} getLevelColor={getLevelColor} />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-3 bg-gray-50 text-sm text-gray-600">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>
    </div>
  );
};

const LogEntryCard: React.FC<{
  log: LogEntry;
  getLevelColor: (level: LogLevel) => string;
}> = ({ log, getLevelColor }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border rounded-lg p-3 ${getLevelColor(log.level)}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${getLevelColor(log.level).replace('text-', 'bg-').replace('-600', '-500')}`}>
              {log.level}
            </span>
            <span className="text-xs font-medium text-gray-700">{log.category}</span>
            <span className="text-xs text-gray-500">
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </div>
          <p className="text-sm font-medium">{log.message}</p>
          {log.userAction && (
            <p className="text-xs text-gray-600 mt-1">User Action: {log.userAction}</p>
          )}
          {log.performanceMetric && (
            <p className="text-xs text-gray-600 mt-1">
              Performance: {log.performanceMetric.operation} - {log.performanceMetric.duration}ms
            </p>
          )}
        </div>
        {(log.data || log.stackTrace) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            {expanded ? 'Hide' : 'Show'} Details
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          {log.data && (
            <div className="mb-2">
              <p className="text-xs font-semibold mb-1">Data:</p>
              <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          )}
          {log.stackTrace && (
            <div>
              <p className="text-xs font-semibold mb-1">Stack Trace:</p>
              <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                {log.stackTrace}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
