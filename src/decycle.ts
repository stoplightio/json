import fastStringify from '@stoplight/fast-safe-stringify';

export const decycle = <T = any>(
  value: T,
  replacer?: (value: any, key: string, stack: Array<[any, any]>, parent?: any) => any | void
): T => {
  if (typeof value !== 'object') return value;
  fastStringify.decycle(value, replacer);
  return value;
};
