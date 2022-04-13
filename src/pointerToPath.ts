import { JsonPath } from '@stoplight/types';
import { decodePointer } from './decodePointer';

export const pointerToPath = (pointer: string): JsonPath => {
  return decodeUriFragmentIdentifier(pointer);
};

const decodeFragmentSegments = (segments: string[]): string[] => {
  const len = segments.length;
  const res = [];
  let i = -1;

  while (++i < len) {
    res.push(decodePointer(segments[i]));
  }

  return res;
};

const decodeUriFragmentIdentifier = (ptr: string): string[] => {
  if (!ptr || ptr.length === 1) {
    return [];
  }

  if (ptr[1] !== '/') {
    throw new URIError('Invalid JSON Pointer syntax.');
  }

  return decodeFragmentSegments(ptr.substring(2).split('/'));
};
