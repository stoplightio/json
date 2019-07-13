import fastStringify from 'safe-stable-stringify';

export const safeStringify = (
  value: any,
  replacer?: (key: string, value: any) => any | Array<number | string> | null,
  space?: string | number,
): string => {
  if (typeof value === 'string') {
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
