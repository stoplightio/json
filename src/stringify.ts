import { safeStringify } from './safeStringify';

/**
 * This function exists to make our lives easier.
 * We attempted to get the overload right for safeStringify, but we eventually gave up and returned to the old signature with Optional<string> being returned for all arguments.
 * Trying to cover all the cases such as toJSON method returning unserializable data, Symbols, Functions, etc. turned out to be a bit too much for TS.
 * It just goes beyond a plain type-checking.
 * Do note that JSON.stringify is also a bit off when it comes to the signature - string is not always returned in case of JSON.stringify as well, so the typings are incorrect.
 * Whether or not to use stringify or safeStringify is up to the consumer. If one is okay with undefined data, there is no need to switch.
 */
export const stringify = (
  value: any,
  replacer?: (key: string, value: any) => any | Array<number | string> | null,
  space?: string | number,
): string => {
  const stringified = safeStringify(value, replacer, space);

  if (stringified === void 0) {
    throw new Error('The value could not be stringified');
  }

  return stringified;
};
