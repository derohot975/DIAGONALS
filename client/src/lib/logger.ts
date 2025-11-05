/**
 * Sistema di logging strutturato per DIAGONALE
 * Sostituisce console.log con logging configurabile per ambiente
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
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private createEntry(level: LogLevel, message: string, context?: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
    };
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? `[${entry.context}]` : '';
    return `${entry.timestamp} ${levelName} ${contextStr} ${entry.message}`;
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const message = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(message, entry.data);
        }
        break;
      case LogLevel.INFO:
        if (this.isDevelopment) {
          console.info(message, entry.data);
        }
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(message, entry.data, entry.error);
        break;
    }
  }

  debug(message: string, context?: string, data?: any): void {
    const entry = this.createEntry(LogLevel.DEBUG, message, context, data);
    this.output(entry);
  }

  info(message: string, context?: string, data?: any): void {
    const entry = this.createEntry(LogLevel.INFO, message, context, data);
    this.output(entry);
  }

  warn(message: string, context?: string, data?: any): void {
    const entry = this.createEntry(LogLevel.WARN, message, context, data);
    this.output(entry);
  }

  error(message: string, context?: string, error?: Error, data?: any): void {
    const entry = this.createEntry(LogLevel.ERROR, message, context, data, error);
    this.output(entry);
  }

  // Metodi di convenienza per contesti specifici
  api(message: string, data?: any): void {
    this.debug(message, 'API', data);
  }

  auth(message: string, data?: any): void {
    this.info(message, 'AUTH', data);
  }

  performance(message: string, data?: any): void {
    this.debug(message, 'PERF', data);
  }

  ui(message: string, data?: any): void {
    this.debug(message, 'UI', data);
  }
}

// Singleton logger instance
export const logger = new Logger();

// Export default per compatibilità
export default logger;
