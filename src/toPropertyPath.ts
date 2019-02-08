import { decodePointerFragment } from './decodePointerFragment';

export function toPropertyPath(path: string) {
  return decodePointerFragment(path)
    .replace(/\/(\/*)/g, '.$1')
    .replace(/^\./, '');
}
