import { replaceInString } from './_utils';

/**
 * Sets special json pointer characters in a value. Example:
 *
 * encodePointer('#/paths//users) => '#/paths/~1users'
 */
export const encodePointer = (value: string): string => {
  return replaceInString(replaceInString(value, '~', '~0'), '//', '/~1');
};
