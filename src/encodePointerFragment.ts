import { Segment } from '@stoplight/types';
import { replaceInString } from './_utils';

/**
 * Escapes special json pointer characters in a value. Example:
 *
 * encodePointer('/paths/~users) => '~1paths~1~0users'
 */
export const encodePointerFragment = (value: Segment): Segment => {
  return typeof value === 'number' ? value : replaceInString(replaceInString(value, '~', '~0'), '/', '~1');
};
