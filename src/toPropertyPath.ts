import { decodePointerFragment } from './decodePointerFragment';

export function toPropertyPath(path: string) {
  return path
    .replace(/^(\/|#\/)/, '')
    .split('/')
    .map(decodePointerFragment)
    .join('.');
}
