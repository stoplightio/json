import { JsonPath, Segment } from '@stoplight/types';

import { encodePointerUriFragment } from './encodePointerUriFragment';

function encodePointerFragment(segment: Segment): Segment {
  return typeof segment === 'number' ? segment : encodePointerUriFragment(segment);
}

export const pathToPointer = (path: JsonPath): string => {
  return encodeUriFragmentIdentifier(path);
};

const encodeUriFragmentIdentifier = (path: JsonPath): string => {
  if (path && typeof path !== 'object') {
    throw new TypeError('Invalid type: path must be an array of segments.');
  }

  if (path.length === 0) {
    return '#';
  }

  return `#/${path.map(encodePointerFragment).join('/')}`;
};
