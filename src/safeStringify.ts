import fastStringify from '@stoplight/fast-safe-stringify';

export const safeStringify = (
  value: any,
  replacer?: (key: string, value: any) => any,
  space?: string | number
): string => {
  try {
    // try regular stringify first as mentioned in this tip:
    // https://github.com/davidmarkclements/fast-safe-stringify#protip
    return JSON.stringify(value, replacer, space);
  } catch {
    return fastStringify(value, replacer, space);
  }
};
