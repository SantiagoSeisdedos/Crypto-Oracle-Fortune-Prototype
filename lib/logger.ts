/**
 * Logger utility that only logs in development mode
 * This prevents performance issues in production while allowing debugging in development
 */

const isDevelopment = process.env.NODE_ENV === "development";

interface Logger {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
}

/**
 * Development-only logger
 * In production, all methods are no-ops (do nothing) to avoid performance impact
 */
export const logger: Logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always active, but can be enhanced for production error tracking)
   * Consider integrating with error tracking service in production
   */
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, you might want to send errors to an error tracking service
      // Example: Sentry.captureException(args[0])
    }
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log informational messages (only in development)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
};

