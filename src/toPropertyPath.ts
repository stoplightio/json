import { decodePointerFragment } from './decodePointerFragment';

export function toPropertyPath(path: string) {
  return path
    .replace(/^(\/|#\/)/, '')
    .split('/')
    .map(decodePointerFragment)
    .map(sanitize)
    .join('.');
}

function sanitize(fragment: string) {
  if (fragment.includes('.')) {
    return `["${fragment.replace(/"/g, '\\"')}"]`;
  } else {
    return fragment;
  }
}
