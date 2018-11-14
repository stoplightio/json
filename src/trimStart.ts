const _trimStart = require('lodash/trimStart');

/**
 * Removes elems from target, matched in order, starting on the left.
 *
 * Supports strings AND arrays, unlike `lodash.trimStart()`.
 *
 * trimStart([1, 2, 3], [1, 2]) === [3]
 * trimStart([1, 2, 3], [999, 2]) === [1, 2, 3] since source[0] does not equal elems[0]
 */
export const trimStart = (target: any[] | string, elems: any[] | string) => {
  if (typeof target === 'string') {
    return _trimStart(target, elems);
  }

  if (!elems || !elems.length || !(elems instanceof Array)) return target;

  let toRemove = 0;
  for (const i in target) {
    if (!target.hasOwnProperty(i)) continue;
    if (target[i] !== elems[i]) break;
    toRemove++;
  }

  return target.slice(toRemove);
};
