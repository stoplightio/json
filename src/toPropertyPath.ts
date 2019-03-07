import { decodePointerFragment } from './decodePointerFragment';

export function toPropertyPath(path: string) {
  return path
    .replace(/^(\/|#\/)/, '')
    .split('/')
    .map(decodePointerFragment)
    .map(fragment => (fragment.indexOf('.') > -1 ? `["${fragment}"]` : fragment))
    .join('.');
}
