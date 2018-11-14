const _set = require('lodash/set');

/**
 * Simple wrapper around `lodash.set()`.
 */
export const set = (obj: any, path: string | string[], value: any): any => {
  return _set(obj, path, value);
};
