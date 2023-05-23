import { JsonPath } from '@stoplight/types';

import { encodePointerUriFragment } from './encodePointerUriFragment';

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

  return `#/${path.map(encodePointerUriFragment).join('/')}`;
};
