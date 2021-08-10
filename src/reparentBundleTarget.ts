import { isLocalRef } from './isLocalRef';
import { isPlainObject } from './isPlainObject';
import { pointerToPath } from './pointerToPath';

function isObject(maybeObj: unknown): maybeObj is Record<string, unknown> | unknown[] {
  return isPlainObject(maybeObj) || Array.isArray(maybeObj);
}

export function reparentBundleTarget(document: Record<string, unknown>, from: string, to: string): void {
  if (to.length <= 1 || from.length <= 1) {
    throw Error('Source/target path must not be empty and point at root');
  }

  if (from.indexOf(to) === 0) {
    throw Error('Target path cannot be contained within source');
  }

  const sourcePath = pointerToPath(from);
  let value: unknown = document;
  for (const segment of sourcePath) {
    if (!isObject(value)) {
      return;
    }

    value = value[segment];
  }

  if (!isObject(value)) {
    return;
  }

  const targetPath = pointerToPath(to);
  let newTarget: unknown = document;
  for (const [i, segment] of targetPath.entries()) {
    if (!isObject(newTarget) || segment in newTarget) {
      return;
    }

    const newValue = i === targetPath.length - 1 ? value : {};
    newTarget[segment] = newValue;
    newTarget = newValue;
  }

  delete document[sourcePath[0]];
  _reparentBundleTarget(document, from, to);
}

function _reparentBundleTarget(document: Record<string, unknown> | unknown[], from: string, to: string): void {
  for (const key of Object.keys(document)) {
    const value = document[key];

    if (key === '$ref') {
      if (typeof value !== 'string' || !isLocalRef(value)) continue;
      if (value.indexOf(from) === 0) {
        document[key] = value.replace(from, to);
      }

      continue;
    }

    if (isObject(value)) {
      _reparentBundleTarget(value, from, to);
    }
  }
}
