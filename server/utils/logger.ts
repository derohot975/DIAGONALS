/**
 * Sistema di logging strutturato per DIAGONALE Server
 * Logging configurabile per ambiente con supporto file e console
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
  requestId?: string;
}

class ServerLogger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private createEntry(
    level: LogLevel, 
    message: string, 
    context?: string, 
    data?: any, 
    error?: Error,
    requestId?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
      requestId,
    };
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? `[${entry.context}]` : '';
    const requestStr = entry.requestId ? `[${entry.requestId}]` : '';
    return `${entry.timestamp} ${levelName} ${contextStr}${requestStr} ${entry.message}`;
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const message = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(message, entry.error?.stack || entry.data || '');
        break;
    }
  }

  debug(message: string, context?: string, data?: any, requestId?: string): void {
    const entry = this.createEntry(LogLevel.DEBUG, message, context, data, undefined, requestId);
    this.output(entry);
  }

  info(message: string, context?: string, data?: any, requestId?: string): void {
    const entry = this.createEntry(LogLevel.INFO, message, context, data, undefined, requestId);
    this.output(entry);
  }

  warn(message: string, context?: string, data?: any, requestId?: string): void {
    const entry = this.createEntry(LogLevel.WARN, message, context, data, undefined, requestId);
    this.output(entry);
  }

  error(message: string, context?: string, error?: Error, data?: any, requestId?: string): void {
    const entry = this.createEntry(LogLevel.ERROR, message, context, data, error, requestId);
    this.output(entry);
  }

  // Metodi di convenienza per contesti specifici
  db(message: string, data?: any, requestId?: string): void {
    this.debug(message, 'DB', data, requestId);
  }

  api(message: string, data?: any, requestId?: string): void {
    this.info(message, 'API', data, requestId);
  }

  auth(message: string, data?: any, requestId?: string): void {
    this.info(message, 'AUTH', data, requestId);
  }

  request(method: string, path: string, statusCode?: number, requestId?: string): void {
    const message = `${method} ${path}${statusCode ? ` - ${statusCode}` : ''}`;
    this.info(message, 'REQ', undefined, requestId);
  }
}

// Singleton logger instance
export const logger = new ServerLogger();

// Export default per compatibilità
export default logger;
