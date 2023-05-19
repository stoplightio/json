import { replaceInString } from './_utils';

/**
 * Removes special json pointer characters in a value. Example:
 *
 * decodePointer('#/paths/~1users) => '#/paths//users'
 */
export const decodePointerFragment = (value: string): string => {
  return decodeURIComponent(replaceInString(replaceInString(value, '~1', '/'), '~0', '~'));
};
