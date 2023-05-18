import { JsonPath, Segment } from '@stoplight/types';

import { encodePointerFragment } from './encodePointerFragment';

export const pathToPointer = (path: JsonPath): string => {
  return encodeUriFragmentIdentifier(path);
};

const ENCODABLE_CHAR = /[^a-zA–Z0–9_.!~*'()\/-]/g;

function encode(input: Segment): Segment {
  const encoded = encodePointerFragment(input);
  return typeof encoded === 'string' ? encoded.replace(ENCODABLE_CHAR, encodeURIComponent) : encoded;
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
