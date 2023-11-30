import { dirname, isAbsolute, join } from '@stoplight/path';
import { JsonPath } from '@stoplight/types';

import { extractSourceFromRef } from '../extractSourceFromRef';
import { isPlainObject } from '../isPlainObject';
import { assertObjectWithValidRef, assertResolvableInput, hasSomeRef } from './guards';

export function applyOverrides(document: unknown, value: unknown) {
  if (isPlainObject(value) && isPlainObject(document)) {
    //update value of unexpected $ref siblings
    for (const key of Object.keys(value)) {
      if (key in document) {
        value[key] = document[key];
      }
    }
    //ensure the value is preserved of expected $ref siblings
    return {
      ...value,
      ...('description' in document ? { description: document.description } : null),
      ...('summary' in document ? { summary: document.summary } : null),
    };
  }

  return value;
}

export function resolveSource(origin: string, ref: string): string {
  const source = extractSourceFromRef(ref);
  if (source === null) {
    return origin;
  }

  if (isAbsolute(source)) {
    return source;
  }

  return join(dirname(origin), source);
}

export function* traverse(
  ctx: { value: unknown },
  path: JsonPath,
  pointer: string,
): IterableIterator<[index: number, value: Record<string, unknown> & { $ref: string }]> {
  if (hasSomeRef(ctx.value)) {
    assertObjectWithValidRef(ctx.value);
    yield [-1, ctx.value];
  }

  for (const [i, segment] of path.entries()) {
    assertResolvableInput(ctx.value, segment, pointer);

    ctx.value = ctx.value[segment];

    if (hasSomeRef(ctx.value)) {
      assertObjectWithValidRef(ctx.value);
      yield [i, ctx.value];
    }
  }
}
