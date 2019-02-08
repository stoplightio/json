import { decodePointerFragment } from './decodePointerFragment';

export function getLastPathSegment(path: string) {
  return decodePointerFragment(path.split('/').pop() || '');
}
