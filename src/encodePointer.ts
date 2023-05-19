import { replaceInString } from './_utils';
import { encodeUriPointer } from './encodeUriPointer';

/**
 * Sets special json pointer characters in a value. Example:
 *
 * encodePointer('#/paths//users) => '#/paths/~1users'
 */
export const encodePointer = (value: string): string => {
  return encodeUriPointer(replaceInString(replaceInString(value, '~', '~0'), '//', '/~1'));
};
