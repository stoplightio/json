import { Dictionary, JsonPath } from '@stoplight/types';

import { extractSourceFromRef } from '../extractSourceFromRef';
import { pointerToPath } from '../pointerToPath';
import { assertObjectWithValidRef, hasSomeRef } from './guards';
import { ResolvedRef } from './types';
import { applyOverrides, traverse } from './utils';

function _resolveInlineRefWithLocation(
  document: Record<string, unknown>,
  pointer: string,
  seen: unknown[],
  prevLocation?: JsonPath,
): ResolvedRef {
  const source = extractSourceFromRef(pointer);
  if (source !== null) {
    throw new ReferenceError('Cannot resolve external references');
  }

  const path = pointerToPath(pointer);
  let location = [...path];

  if (pointer === '#' && hasSomeRef(document)) {
    assertObjectWithValidRef(document);
    path.unshift(...pointerToPath(document.$ref));
  }

  const ctx: { value: unknown } = { value: document };

  for (const [i, value] of traverse(ctx, path, pointer)) {
    if (seen.includes(value)) {
      return {
        source: null,
        location: prevLocation ?? location,
        value: seen[seen.length - 1],
      };
    }

    seen.push(value);

    const result = _resolveInlineRefWithLocation(document, value.$ref, seen, location);
    ctx.value = result.value;
    location = result.location;
    location.push(...path.slice(i + 1));
  }

  return {
    source: null,
    location,
    value: seen.length > 0 ? applyOverrides(seen[seen.length - 1], ctx.value) : ctx.value,
  };
}

export function resolveInlineRef(document: Record<string, unknown>, pointer: string): unknown {
  return resolveInlineRefWithLocation(document, pointer).value;
}

export function resolveInlineRefWithLocation(document: Dictionary<unknown>, pointer: string): ResolvedRef {
  return _resolveInlineRefWithLocation(document, pointer, []);
}
