import { Segment } from '@stoplight/types';

import { encodePointerFragment } from './encodePointerFragment';
import { encodeUriPointer } from './encodeUriPointer';

/**
 * Escapes special json pointer characters in a value.
 * Percent-encode characters.
 *
 * @example encodePointer('/paths/~users) => '~1paths~1~0users'
 */
export const encodePointerUriFragment = (value: Segment): Segment => {
  const encoded = encodePointerFragment(value);
  return typeof encoded === 'number' ? encoded : encodeUriPointer(encoded);
};
