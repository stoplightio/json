import { decodePointerFragment } from './decodePointerFragment';

export function getLastPathSegment(path: string) {
  const match = /\/([^/]+$)/.exec(decodePointerFragment(path));
  return match ? match[1] : path;
}
