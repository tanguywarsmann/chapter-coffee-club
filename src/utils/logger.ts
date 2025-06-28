
/**
 * SYSTÈME DE LOGS CENTRALISÉ - READ APP
 * 
 * Remplace tous les console.log/error/warn éparpillés
 * Permet un contrôle centralisé des logs avec niveaux
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Limite pour éviter les fuites mémoire

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, component: string, message: string, data?: any, error?: Error) {
    if (level > this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data,
      error
    };

    // Stocker en mémoire
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Affichage console en développement
    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${component}]`;
      switch (level) {
        case LogLevel.ERROR:
          console.error(`🔴 ${prefix}`, message, data || '', error || '');
          break;
        case LogLevel.WARN:
          console.warn(`🟡 ${prefix}`, message, data || '');
          break;
        case LogLevel.INFO:
          console.info(`🔵 ${prefix}`, message, data || '');
          break;
        case LogLevel.DEBUG:
          console.log(`⚪ ${prefix}`, message, data || '');
          break;
      }
    }
  }

  error(component: string, message: string, error?: Error, data?: any) {
    this.log(LogLevel.ERROR, component, message, data, error);
  }

  warn(component: string, message: string, data?: any) {
    this.log(LogLevel.WARN, component, message, data);
  }

  info(component: string, message: string, data?: any) {
    this.log(LogLevel.INFO, component, message, data);
  }

  debug(component: string, message: string, data?: any) {
    this.log(LogLevel.DEBUG, component, message, data);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level === undefined) return [...this.logs];
    return this.logs.filter(log => log.level <= level);
  }

  clearLogs() {
    this.logs = [];
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }
}

// Instance globale
export const logger = Logger.getInstance();

// Hooks utilitaires pour les composants
export const useLogger = (componentName: string) => {
  return {
    error: (message: string, error?: Error, data?: any) => logger.error(componentName, message, error, data),
    warn: (message: string, data?: any) => logger.warn(componentName, message, data),
    info: (message: string, data?: any) => logger.info(componentName, message, data),
    debug: (message: string, data?: any) => logger.debug(componentName, message, data)
  };
};
