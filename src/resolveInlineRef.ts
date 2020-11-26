import { Dictionary } from '@stoplight/types';
import { extractSourceFromRef } from './extractSourceFromRef';
import { pointerToPath } from './pointerToPath';

function isObject(maybeObj: unknown): maybeObj is { [key in PropertyKey]: unknown } {
  return typeof maybeObj === 'object' && maybeObj !== null;
}

function _resolveInlineRef(document: Dictionary<unknown>, ref: string, seen: unknown[]): unknown {
  const source = extractSourceFromRef(ref);
  if (source !== null) {
    throw new ReferenceError('Cannot resolve external references');
  }

  const path = pointerToPath(ref);
  let value: unknown = document;
  for (const segment of path) {
    if (!isObject(value) || !(segment in value)) {
      throw new ReferenceError(`Could not resolve '${ref}'`);
    }

    value = value[segment];

    if (isObject(value) && '$ref' in value) {
      if (seen.includes(value)) {
        // circular, let's stop
        return seen[seen.length - 1];
      }

      seen.push(value);

      if (typeof value.$ref !== 'string') {
        throw new TypeError('$ref should be a string');
      }

      value = _resolveInlineRef(document, value.$ref, seen);
    }
  }

  return value;
}

export function resolveInlineRef(document: Dictionary<unknown>, ref: string): unknown {
  return _resolveInlineRef(document, ref, []);
}
