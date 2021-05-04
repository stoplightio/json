import { Dictionary } from '@stoplight/types';
import { isPlainObject } from './_utils';
import { extractSourceFromRef } from './extractSourceFromRef';
import { pointerToPath } from './pointerToPath';

function _resolveInlineRef(document: Dictionary<unknown>, ref: string, seen: unknown[]): unknown {
  const source = extractSourceFromRef(ref);
  if (source !== null) {
    throw new ReferenceError('Cannot resolve external references');
  }

  const path = pointerToPath(ref);
  let value: unknown = document;
  for (const segment of path) {
    if (!isPlainObject(value) || !(segment in value)) {
      throw new ReferenceError(`Could not resolve '${ref}'`);
    }

    value = value[segment];

    if (isPlainObject(value) && '$ref' in value) {
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

  if (seen.length === 0) {
    return value;
  }

  const sourceDocument = seen[seen.length - 1];

  if (isPlainObject(sourceDocument) && ('summary' in sourceDocument || 'description' in sourceDocument)) {
    return {
      ...value,
      ...('description' in sourceDocument ? { description: sourceDocument.description } : null),
      ...('summary' in sourceDocument ? { summary: sourceDocument.summary } : null),
    };
  }

  return value;
}

export function resolveInlineRef(document: Dictionary<unknown>, ref: string): unknown {
  return _resolveInlineRef(document, ref, []);
}
