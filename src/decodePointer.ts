import { replaceInString } from './_utils';

/**
 * Removes special json pointer characters in a value. Example:
 *
 * decodePointer('#/paths/~1users) => '#/paths//users'
 */
export const decodePointer = (value: string): string => {
  return replaceInString(replaceInString(decodeURIComponent('' + value), '~1', '/'), '~0', '~');
};
