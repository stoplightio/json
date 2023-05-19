import { replaceInString } from './_utils';

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const PERCENT_ENCODING_OCTET = /%[0-9a-f]+/gi;

/**
 * Removes special json pointer characters in a value. Example:
 *
 * decodePointer('#/paths/~1users) => '#/paths//users'
 */
export const decodePointerUriFragment = (value: string): string => {
  let decoded;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    decoded = value.replace(PERCENT_ENCODING_OCTET, safeDecodeURIComponent);
  }

  return replaceInString(replaceInString(decoded, '~1', '/'), '~0', '~');
};
