import { replaceInString } from './_utils';

/**
 * Escapes special json pointer characters in a value. Example:
 *
 * encodePointer('/paths/~users) => '~1paths~1~0users'
 */
export const encodePointerFragment = (value: string): string => {
  return replaceInString(replaceInString(value, '~', '~0'), '/', '~1');
};
