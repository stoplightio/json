import { replaceInString } from './_utils';

export const pathToPointer = (path: string[]): string => {
  return encodeUriFragmentIdentifier(path);
};

const encodeFragmentSegment = (segment: string): string => {
  if (typeof segment === 'string') {
    return replaceInString(replaceInString(segment, '~', '~0'), '/', '~1');
  }

  return segment;
};

const encodeFragmentSegments = (segments: string[]): string[] => {
  return segments.map(encodeFragmentSegment);
};

const encodeUriFragmentIdentifier = (path: string[]): string => {
  if (path && typeof path !== 'object') {
    throw new TypeError('Invalid type: path must be an array of segments.');
  }

  if (path.length === 0) {
    return '#';
  }

  return `#/${encodeFragmentSegments(path).join('/')}`;
};
