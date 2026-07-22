/**
 * Thin logger — docs/code-standards.md §8. Use this instead of scattered `console.log`.
 * Only intentional `logger.warn/error` should remain in committed code.
 */
type LogArgs = readonly unknown[];

export const logger = {
  debug: (...args: LogArgs) => {
    if (__DEV__) console.log(...args);
  },
  warn: (...args: LogArgs) => {
    console.warn(...args);
  },
  error: (...args: LogArgs) => {
    console.error(...args);
  },
} as const;
