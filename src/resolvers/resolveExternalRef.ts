import type { JsonPath } from '@stoplight/types';

import { extractPointerFromRef } from '../extractPointerFromRef';
import { pointerToPath } from '../pointerToPath';
import { ResolvedRef } from './types';
import { applyOverrides, resolveSource, traverse } from './utils';

type Document = Record<string, unknown> | unknown[];

async function _resolveExternalRefWithLocation(
  inventory: Record<string, Document | Promise<Document>>,
  origin: string,
  ref: string,
  seen: unknown[],
  prevLocation?: JsonPath,
): Promise<ResolvedRef<string>> {
  let source = resolveSource(origin, ref);
  const pointer = extractPointerFromRef(ref) || '#';
  const document = await inventory[source];
  const path = pointerToPath(pointer);
  let location = [...path];
  const ctx: { value: unknown } = { value: document };

  for (const [i, value] of traverse(ctx, path, pointer)) {
    if (seen.includes(value)) {
      return {
        source: origin,
        location: prevLocation ?? location,
        value: seen[seen.length - 1],
      };
    }

    seen.push(value);
    const result = await _resolveExternalRefWithLocation(inventory, source, value.$ref, seen, location);

    ({ source, location } = result);
    ctx.value = result.value;
    location.push(...path.slice(i + 1));
  }

  return {
    source,
    location,
    value: seen.length > 0 ? applyOverrides(seen[seen.length - 1], ctx.value) : ctx.value,
  };
}

export async function resolveExternalRef(
  inventory: Record<string, Document | Promise<Document>>,
  origin: string,
  ref: string,
): Promise<unknown> {
  return (await resolveExternalRefWithLocation(inventory, origin, ref)).value;
}

export function resolveExternalRefWithLocation(
  inventory: Record<string, Document | Promise<Document>>,
  origin: string,
  ref: string,
): Promise<{ source: string; location: JsonPath; value: unknown }> {
  return _resolveExternalRefWithLocation(inventory, origin, ref, []);
}
