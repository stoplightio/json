import { decodePointer } from './decodePointer';

export const pointerToPath = (pointer: string): string[] => {
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
  if (typeof ptr !== 'string') {
    throw new TypeError('Invalid type: JSON Pointers are represented as strings.');
  }

  if (ptr.length === 0 || ptr[0] !== '#') {
    throw new URIError('Invalid JSON Pointer syntax; URI fragment idetifiers must begin with a hash.');
  }

  if (ptr.length === 1) {
    return [];
  }

  if (ptr[1] !== '/') {
    throw new URIError('Invalid JSON Pointer syntax.');
  }

  return decodeFragmentSegments(ptr.substring(2).split('/'));
};
