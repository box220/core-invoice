# Logging System Guide

## Overview

The Invoice Generator application includes a comprehensive logging system that tracks all user actions, system events, errors, and performance metrics. This guide explains how to use and interact with the logging system.

## Features

- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR
- **Persistent Storage**: Logs stored in browser's localStorage
- **Export/Import**: Export logs to JSON file for analysis
- **Performance Tracking**: Automatic tracking of operation execution times
- **User Action Tracking**: Records all user interactions
- **Error Tracking**: Captures errors with full stack traces
- **Search & Filter**: Search logs by keyword, filter by level and category
- **Statistics**: View aggregated statistics about log entries

## Log Levels

### DEBUG
Used for detailed diagnostic information, useful during development.
```typescript
log.debug('Invoice', 'Recalculating invoice totals', { subtotal, vat, total });
```

### INFO
General informational messages about application flow.
```typescript
log.info('Storage', 'Invoice saved successfully', { invoiceId });
```

### WARN
Warning messages for potentially harmful situations.
```typescript
log.warn('PDF', 'PDF generation taking longer than expected', { duration });
```

### ERROR
Error events that might still allow the application to continue running.
```typescript
log.error('PDF', 'Failed to generate PDF', error, { invoiceNumber });
```

## Categories

The application uses predefined categories to organize logs:

- `App` - Application lifecycle events
- `Invoice` - Invoice operations (create, update, calculate)
- `Template` - Template management operations
- `PDF` - PDF generation and export
- `Storage` - LocalStorage operations
- `Editor` - UI editor interactions
- `UI` - General UI interactions
- `Performance` - Performance metrics
- `Error` - General errors

## Usage Examples

### Basic Logging

```typescript
import { log, LogCategory } from './utils/logger';

// Simple info log
log.info(LogCategory.INVOICE, 'Invoice created successfully');

// Log with data
log.info(LogCategory.INVOICE, 'Invoice updated', {
  invoiceId: invoice.id,
  invoiceNumber: invoice.details.invoiceNumber
});

// Error logging
try {
  // ... some operation
} catch (error) {
  log.error(LogCategory.STORAGE, 'Failed to save data', error, {
    operation: 'save',
    data: someData
  });
}
```

### User Action Tracking

```typescript
// Track user actions
log.userAction('Generate PDF', LogCategory.PDF, {
  invoiceNumber: invoice.details.invoiceNumber
});

log.userAction('Load Template', LogCategory.TEMPLATE, {
  templateId: template.id,
  templateName: template.name
});
```

### Performance Tracking

```typescript
// Automatic performance tracking
const result = await log.track(
  'PDF Generation',
  LogCategory.PDF,
  async () => {
    return await generateInvoicePDF('invoice-preview', fileName);
  },
  { fileName }
);

// Manual performance logging
const startTime = performance.now();
// ... operation ...
const duration = performance.now() - startTime;
log.performance('Invoice Calculation', duration, LogCategory.INVOICE);
```

## Viewing Logs

### In-App Log Viewer

1. Click on **"System Logs"** tab in the navigation
2. Use the search bar to find specific logs
3. Filter by log level (ERROR, WARN, INFO, DEBUG)
4. Filter by category
5. Click "Show Stats" to view statistics
6. Click "Export" to download logs as JSON

### Log Entry Details

Each log entry contains:
- **ID**: Unique identifier
- **Timestamp**: When the log was created
- **Level**: Log level (DEBUG, INFO, WARN, ERROR)
- **Category**: Log category
- **Message**: Human-readable message
- **Data**: Additional structured data (optional)
- **Stack Trace**: For errors (optional)
- **User Action**: For user action logs (optional)
- **Performance Metric**: Operation name and duration (optional)

### Statistics View

The statistics panel shows:
- Total number of logs
- Count by level (DEBUG, INFO, WARN, ERROR)
- Error and warning counts
- Average performance metrics by operation
- Log distribution by category

## Configuration

### Enable/Disable Logging

```typescript
import { logger, LogLevel } from './utils/logger';

// Disable all logging
logger.configure(false, LogLevel.DEBUG);

// Enable logging at INFO level and above
logger.configure(true, LogLevel.INFO);

// Enable only ERROR logs
logger.configure(true, LogLevel.ERROR);
```

### Settings Persistence

Logger settings are automatically saved to localStorage and persist across sessions.

## Log Storage

### Storage Location
Logs are stored in browser's localStorage under the key: `invoice_app_logs`

### Storage Limits
- Maximum 1000 log entries are kept
- Older logs are automatically removed when limit is reached
- Each log entry is stored as JSON

### Clearing Logs

```typescript
import { logger } from './utils/logger';

// Clear all logs
logger.clearLogs();
```

## Export/Import

### Exporting Logs

```typescript
// Export as JSON string
const logsJson = logger.exportLogs();

// Export and download as file
logger.exportLogsAsFile('my-logs.json');
```

### Log File Format

```json
[
  {
    "id": "1699999999999-abc123",
    "timestamp": "2025-11-13T15:30:00.000Z",
    "level": "INFO",
    "category": "Invoice",
    "message": "Invoice created successfully",
    "data": {
      "invoiceId": "123",
      "invoiceNumber": "CORE-2025-11-13-01"
    }
  }
]
```

## Searching Logs

### Search Methods

```typescript
import { logger } from './utils/logger';

// Search by keyword
const results = logger.searchLogs('PDF');

// Get logs by level
const errors = logger.getLogsByLevel(LogLevel.ERROR);

// Get logs by category
const invoiceLogs = logger.getLogsByCategory('Invoice');

// Get logs by time range
const recentLogs = logger.getLogsByTimeRange(
  '2025-11-13T00:00:00.000Z',
  '2025-11-13T23:59:59.999Z'
);
```

## Best Practices

### 1. Choose Appropriate Log Levels
- Use DEBUG for development-only information
- Use INFO for normal operations
- Use WARN for recoverable issues
- Use ERROR for failures

### 2. Include Context Data
Always include relevant data to make debugging easier:
```typescript
// Good
log.error('Invoice', 'Validation failed', error, {
  invoiceId: invoice.id,
  errors: validationErrors
});

// Not as helpful
log.error('Invoice', 'Validation failed', error);
```

### 3. Log User Actions
Track important user interactions:
```typescript
log.userAction('Download PDF', LogCategory.PDF, {
  invoiceNumber: invoice.details.invoiceNumber,
  timestamp: new Date().toISOString()
});
```

### 4. Track Performance
Use performance tracking for critical operations:
```typescript
await log.track('Operation Name', LogCategory.PERFORMANCE, async () => {
  // Your operation here
});
```

### 5. Avoid Logging Sensitive Data
Never log:
- Passwords or authentication tokens
- Personal identifiable information (PII) unless necessary
- Full credit card numbers
- API keys or secrets

## Troubleshooting

### Logs Not Appearing

1. Check if logging is enabled:
```typescript
// In browser console
localStorage.getItem('logger_settings')
```

2. Check log level setting - it might be too high
3. Clear logs and try again
4. Check browser console for errors

### localStorage Full

If localStorage is full:
1. Export current logs
2. Clear old logs: `logger.clearLogs()`
3. Consider reducing log retention (modify MAX_LOGS in logger.ts)

### Performance Issues

If logging causes performance issues:
1. Increase minimum log level to INFO or WARN
2. Disable DEBUG logs in production
3. Reduce MAX_LOGS limit
4. Clear old logs regularly

## Advanced Usage

### Custom Log Queries

```typescript
// Get all errors from last hour
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const recentErrors = logger.getLogsByTimeRange(oneHourAgo, new Date().toISOString())
  .filter(log => log.level === LogLevel.ERROR);

// Get average performance for specific operation
const stats = logger.getStatistics();
const avgPdfTime = stats.averagePerformance['PDF Generation'];
console.log(`Average PDF generation time: ${avgPdfTime}ms`);
```

### Analyzing Logs Programmatically

```typescript
const logs = logger.getLogs();

// Count errors by category
const errorsByCategory = logs
  .filter(log => log.level === LogLevel.ERROR)
  .reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

console.log('Errors by category:', errorsByCategory);
```

## Integration with Development Tools

### Browser DevTools

Logs are automatically output to browser console in development mode:
```
[2025-11-13T15:30:00.000Z] [INFO] [Invoice] Invoice created successfully
```

### Debugging

Set breakpoints in the logger to catch specific events:
```typescript
// In logger.ts, add breakpoint in error() method
error(category: string, message: string, error?: Error | any, data?: any): void {
  debugger; // Breakpoint here
  // ...
}
```

## FAQ

### Q: How long are logs kept?
A: The last 1000 log entries are kept. Older entries are automatically removed.

### Q: Can I export logs automatically?
A: Yes, you can call `logger.exportLogsAsFile()` programmatically or set up automatic exports.

### Q: Do logs affect performance?
A: Minimal impact. DEBUG logs have slightly more overhead. In production, set minimum level to INFO or higher.

### Q: Can I access logs from other sessions?
A: No, logs are per-device/browser. Export logs to share across devices.

### Q: What happens if localStorage is full?
A: Older logs are automatically removed. Export important logs before they're deleted.

### Q: Can I disable logging completely?
A: Yes, call `logger.configure(false, LogLevel.DEBUG)`.

## Support

For issues or questions about the logging system:
1. Check this guide
2. Review the log viewer in the app
3. Check browser console for errors
4. Export logs and analyze them
