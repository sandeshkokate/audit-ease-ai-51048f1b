/**
 * Production-safe logger
 * Suppresses all console output in production builds
 * In development, logs normally to console
 */

const isDev = import.meta.env.DEV;

const createLogger = () => {
  const noop = () => {};

  if (!isDev) {
    return {
      log: noop,
      info: noop,
      warn: noop,
      error: noop,
      debug: noop,
      group: noop,
      groupEnd: noop,
    };
  }

  return {
    log: (...args: any[]) => console.log('[AuditEase]', ...args),
    info: (...args: any[]) => console.info('[AuditEase]', ...args),
    warn: (...args: any[]) => console.warn('[AuditEase]', ...args),
    error: (...args: any[]) => console.error('[AuditEase]', ...args),
    debug: (...args: any[]) => console.debug('[AuditEase]', ...args),
    group: (label: string) => console.group(label),
    groupEnd: () => console.groupEnd(),
  };
};

export const logger = createLogger();
