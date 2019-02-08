import { decodePointer } from './decodePointer';

export function toPropertyPath(path: string) {
  return decodePointer(path)
    .replace(/\/(\/*)/g, '.$1')
    .replace(/^\./, '');
}
