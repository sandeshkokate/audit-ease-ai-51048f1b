const isDev = import.meta.env.DEV;

export const logger = {
  error: (...args: any[]) => {
    if (isDev) console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
};
