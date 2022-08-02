import { Dictionary, JsonPath } from '@stoplight/types';

import { extractSourceFromRef } from './extractSourceFromRef';
import { isPlainObject } from './isPlainObject';
import { pointerToPath } from './pointerToPath';

function _resolveInlineRef(
  document: Dictionary<unknown>,
  ref: string,
  seen: unknown[],
  prevLocation?: JsonPath,
): { location: JsonPath; value: unknown } {
  const source = extractSourceFromRef(ref);
  if (source !== null) {
    throw new ReferenceError('Cannot resolve external references');
  }

  const path = pointerToPath(ref);
  let location = path;
  let value: unknown = document;
  for (const [i, segment] of path.entries()) {
    if ((!isPlainObject(value) && !Array.isArray(value)) || !(segment in value)) {
      throw new ReferenceError(`Could not resolve '${ref}'`);
    }

    value = value[segment];

    if (isPlainObject(value) && '$ref' in value) {
      if (typeof value.$ref !== 'string') {
        throw new TypeError('$ref should be a string');
      }

      if (seen.includes(value)) {
        return {
          location: prevLocation || location,
          value: seen[seen.length - 1],
        };
      }

      seen.push(value);

      ({ value, location } = _resolveInlineRef(document, value.$ref, seen, location));
      location.push(...path.slice(i + 1));
    }
  }

  if (seen.length === 0) {
    return {
      location,
      value,
    };
  }

  const sourceDocument = seen[seen.length - 1];

  if (
    isPlainObject(value) &&
    isPlainObject(sourceDocument) &&
    ('summary' in sourceDocument || 'description' in sourceDocument)
  ) {
    return {
      location,
      value: {
        ...value,
        ...('description' in sourceDocument ? { description: sourceDocument.description } : null),
        ...('summary' in sourceDocument ? { summary: sourceDocument.summary } : null),
      },
    };
  }

  return {
    location,
    value,
  };
}

export function resolveInlineRef(document: Dictionary<unknown>, ref: string): unknown {
  return _resolveInlineRef(document, ref, []).value;
}

export function resolveInlineRefWithLocation(
  document: Dictionary<unknown>,
  ref: string,
): { location: JsonPath; value: unknown } {
  return _resolveInlineRef(document, ref, []);
}
