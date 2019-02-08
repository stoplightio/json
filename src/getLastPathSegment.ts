import { decodePointer } from './decodePointer';

export function getLastPathSegment(path: string) {
  const match = /\/([^/]+$)/.exec(decodePointer(path));
  return match ? match[1] : path;
}
