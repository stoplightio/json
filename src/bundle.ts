import { cloneDeep, get, has, set } from 'lodash';

import { Dictionary } from '@stoplight/types';
import { hasRef } from './hasRef';
import { isLocalRef } from './isLocalRef';
import { pathToPointer } from './pathToPointer';
import { pointerToPath } from './pointerToPath';
import { traverse } from './traverse';

export const BUNDLE_ROOT = '__bundled__';
export const ERRORS_ROOT = '__errors__';

export const bundleTarget = <T = unknown>({ document, path }: { document: T; path: string }, cur?: unknown) =>
  _bundle(cloneDeep(document), path, { [path]: true }, cur);

const _bundle = (
  document: unknown,
  path: string,
  stack: Dictionary<boolean>,
  cur?: unknown,
  bundledRefInventory: any = {},
  bundledObj: any = {},
  errorsObj: any = {},
) => {
  const objectToBundle = get(document, pointerToPath(path));

  traverse(cur ? cur : objectToBundle, ({ parent }) => {
    if (hasRef(parent) && isLocalRef(parent.$ref)) {
      const $ref = parent.$ref;
      if (errorsObj[$ref]) return;

      if (bundledRefInventory[$ref]) {
        parent.$ref = bundledRefInventory[$ref];

        // no need to continue, this $ref has already been bundled
        return;
      }

      let _path;
      let inventoryPath;
      let inventoryRef;

      try {
        _path = pointerToPath($ref);
        inventoryPath = [BUNDLE_ROOT, ..._path];
        inventoryRef = pathToPointer(inventoryPath);
      } catch (error) {
        errorsObj[$ref] = error.message;
      }

      // Ignore invalid $refs and carry on
      if (!_path || !inventoryPath || !inventoryRef) return;

      const bundled$Ref = get(document, _path);
      if (bundled$Ref !== void 0) {
        const pathProcessed = [];

        bundledRefInventory[$ref] = inventoryRef;
        parent.$ref = inventoryRef;

        // make sure arrays and object decisions are preserved when copying over the portion of the tree
        for (const key of _path) {
          pathProcessed.push(key);

          const inventoryPathProcessed = [BUNDLE_ROOT, ...pathProcessed];
          if (has(bundledObj, inventoryPathProcessed)) continue;

          const target = get(document, pathProcessed);
          if (Array.isArray(target)) {
            set(bundledObj, inventoryPathProcessed, []);
          } else if (typeof target === 'object') {
            set(bundledObj, inventoryPathProcessed, {});
          }
        }

        set(bundledObj, inventoryPath, bundled$Ref);
        const parentObj =
          inventoryPath.length === 1 ? bundledObj : get(bundledObj, inventoryPath.slice(0, inventoryPath.length - 1));
        if (Array.isArray(parentObj)) {
          ensureNoSparseArray(parentObj);
        }

        if (!stack[$ref]) {
          stack[$ref] = true;
          _bundle(document, path, stack, bundled$Ref, bundledRefInventory, bundledObj, errorsObj);
          stack[$ref] = false;
        }
      }
    }
  });

  set(objectToBundle, BUNDLE_ROOT, bundledObj[BUNDLE_ROOT]);

  if (Object.keys(errorsObj).length) {
    set(objectToBundle, ERRORS_ROOT, errorsObj);
  }

  return objectToBundle;
};

function ensureNoSparseArray(arr: unknown[]) {
  for (let i = 0; i < arr.length; i++) {
    if (!(i in arr)) {
      arr[i] = null;
    }
  }

  return arr;
}
