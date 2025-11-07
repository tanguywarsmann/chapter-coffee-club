/**
 * Logger utility - maintains backward compatibility with useLogger
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: isDev ? console.log.bind(console) : () => {},
  info: isDev ? console.info.bind(console) : () => {},
  warn: isDev ? console.warn.bind(console) : () => {},
  error: console.error.bind(console),
  debug: isDev ? console.debug.bind(console) : () => {},
  group: isDev ? console.group.bind(console) : () => {},
  groupEnd: isDev ? console.groupEnd.bind(console) : () => {},
  table: isDev ? console.table.bind(console) : () => {},
};

// Backward compatibility hook
export const useLogger = (context: string) => ({
  log: (...args: any[]) => logger.log(`[${context}]`, ...args),
  info: (...args: any[]) => logger.info(`[${context}]`, ...args),
  warn: (...args: any[]) => logger.warn(`[${context}]`, ...args),
  error: (...args: any[]) => logger.error(`[${context}]`, ...args),
  debug: (...args: any[]) => logger.debug(`[${context}]`, ...args),
});

export default logger;
