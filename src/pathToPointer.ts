import { encodePointerFragment } from './encodePointerFragment';

export const pathToPointer = (path: string[]): string => {
  return encodeUriFragmentIdentifier(path);
};

const encodeUriFragmentIdentifier = (path: string[]): string => {
  if (path && typeof path !== 'object') {
    throw new TypeError('Invalid type: path must be an array of segments.');
  }

  if (path.length === 0) {
    return '#';
  }

  return `#/${path.map(encodePointerFragment).join('/')}`;
};
