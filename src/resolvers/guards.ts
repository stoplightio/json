import { Segment } from '@stoplight/types';

import { isPlainObject } from '../isPlainObject';

export function assertResolvableInput(
  value: unknown,
  segment: Segment,
  pointer: string,
): asserts value is Record<string, unknown> | unknown[] {
  if ((!isPlainObject(value) && !Array.isArray(value)) || !(segment in value)) {
    throw new ReferenceError(`Could not resolve '${pointer}'`);
  }
}

export function assertObjectWithValidRef(
  value: Record<string, unknown>,
): asserts value is Record<string, unknown> & { $ref: string } {
  if (typeof value.$ref !== 'string') {
    throw new TypeError('$ref should be a string');
  }
}

export const hasSomeRef = (obj: unknown): obj is Record<string, unknown> & { $ref: unknown } =>
  isPlainObject(obj) && '$ref' in obj;
