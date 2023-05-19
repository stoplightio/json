import { replaceInString } from './_utils';
import { encodeUriPointer } from './encodeUriPointer';

/**
 * Escapes special json pointer characters in a value. Example:
 *
 * encodePointer('/paths/~users) => '~1paths~1~0users'
 */
export const encodePointerUriFragment = (value: string): string => {
  return encodeUriPointer(replaceInString(replaceInString(value, '~', '~0'), '/', '~1'));
};
