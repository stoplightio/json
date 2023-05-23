const ENCODABLE_CHAR = /[^a-zA–Z0–9_.!~*'()\/\-\u{D800}-\u{DFFF}]/gu;

/**
 * Percent-encode a JSON Pointer.
 *
 * encodePointer('paths/users) => '#/paths/~1users'
 */
export function encodeUriPointer(pointer: string): string {
  return pointer.replace(ENCODABLE_CHAR, encodeURIComponent);
}
