import { JsonPath, Segment } from '@stoplight/types';

import { encodePointerFragment } from './encodePointerFragment';
import { encodeUriPointer } from './encodeUriPointer';

export const pathToPointer = (path: JsonPath): string => {
  return encodeUriFragmentIdentifier(path);
};

function encode(input: Segment): Segment {
  const encoded = encodePointerFragment(input);
  return typeof encoded === 'string' ? encodeUriPointer(encoded) : encoded;
}

const encodeUriFragmentIdentifier = (path: JsonPath): string => {
  if (path && typeof path !== 'object') {
    throw new TypeError('Invalid type: path must be an array of segments.');
  }

  if (path.length === 0) {
    return '#';
  }

  return `#/${path.map(encode).join('/')}`;
};
