const _get = require('lodash/get');

/**
 * Simple wrapper around `lodash.get()`.
 */
export const get = (obj: any, path: string | string[], defaultVal?: any): any => {
  return _get(obj, path, defaultVal);
};
