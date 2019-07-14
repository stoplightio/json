import { trimStart as _trimStart } from 'lodash';

/**
 * Removes elems from target, matched in order, starting on the left.
 *
 * Supports strings AND arrays, unlike `lodash.trimStart()`.
 *
 * trimStart([1, 2, 3], [1, 2]) === [3]
 * trimStart([1, 2, 3], [999, 2]) === [1, 2, 3] since source[0] does not equal elems[0]
 */
export const trimStart = (target: any[] | string, elems: any[] | string) => {
  if (typeof target === 'string' && typeof elems === 'string') {
    return _trimStart(target, elems);
  }

  if (!target || !Array.isArray(target) || !target.length || !elems || !Array.isArray(elems) || !elems.length)
    return target;

  let toRemove = 0;
  for (const i in target) {
    if (!target.hasOwnProperty(i)) continue;
    if (target[i] !== elems[i]) break;
    toRemove++;
  }

  return target.slice(toRemove);
};
