import { JsonPath } from '@stoplight/types';

import { decodePointerUriFragment } from './decodePointerUriFragment';

export const pointerToPath = (pointer: string): JsonPath => {
  return decodeUriFragmentIdentifier(pointer);
};

const decodeFragmentSegments = (segments: string[]): string[] => {
  const len = segments.length;
  const res = [];
  let i = -1;

  while (++i < len) {
    res.push(decodePointerUriFragment(segments[i]));
  }

  return res;
};

const decodeUriFragmentIdentifier = (ptr: string): string[] => {
  if (typeof ptr !== 'string') {
    throw new TypeError('Invalid type: JSON Pointers are represented as strings.');
  }

  if (ptr.length === 0 || ptr[0] !== '#') {
    throw new URIError('Invalid JSON Pointer syntax; URI fragment identifiers must begin with a hash.');
  }

  if (ptr.length === 1) {
    return [];
  }

  if (ptr[1] !== '/') {
    throw new URIError('Invalid JSON Pointer syntax.');
  }

  return decodeFragmentSegments(ptr.substring(2).split('/'));
};
