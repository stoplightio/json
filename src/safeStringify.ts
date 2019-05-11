import fastStringify from '@stoplight/fast-safe-stringify';
import { isStringified } from './isStringified';

export const safeStringify = (
  value: any,
  replacer?: (key: string, value: any) => any | Array<string | number> | null,
  space?: string | number
): string => {
  if (isStringified(value)) {
    return value;
  }

  try {
    // try regular stringify first as mentioned in this tip:
    // https://github.com/davidmarkclements/fast-safe-stringify#protip
    return JSON.stringify(value, replacer, space);
  } catch {
    return fastStringify(value, replacer, space);
  }
};
