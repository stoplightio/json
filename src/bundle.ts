import { cloneDeep, get, has, set } from 'lodash';

import { Dictionary } from '@stoplight/types';
import { hasRef } from './hasRef';
import { isLocalRef } from './isLocalRef';
import { pathToPointer } from './pathToPointer';
import { pointerToPath } from './pointerToPath';
import { traverse } from './traverse';

export const BUNDLE_ROOT = '__bundled__';
export const ERRORS_ROOT = '__errors__';

export const bundleTarget = <T = unknown>(
  {
    document,
    path,
    bundleRoot = BUNDLE_ROOT,
    errorsRoot = ERRORS_ROOT,
  }: { document: T; path: string; bundleRoot?: string; errorsRoot?: string },
  cur?: unknown,
) => bundle(bundleRoot, errorsRoot)(cloneDeep(document), path, { [path]: true }, cur);

const bundle = (bundleRoot: string, errorsRoot: string) => {
  const _bundle = (
    document: unknown,
    path: string,
    stack: Dictionary<boolean>,
    cur?: unknown,
    bundledRefInventory: any = {},
    bundledObj: any = {},
    errorsObj: any = {},
  ) => {
    const $refTarget = pointerToPath(path);
    // const $bundleKey = $refTarget[$refTarget.length - 1];
    const objectToBundle = get(document, $refTarget);

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
        let inventoryKeyRoot;
        let inventoryKey;
        let inventoryRef;

        try {
          _path = pointerToPath($ref);

          // TODO: recursive keygen to generate 1, 2, 3, etc if multiple collisions, w some tests
          inventoryKeyRoot = _path[_path.length - 2];
          if (Array.isArray(get(document, _path.slice(0, -1)))) {
            inventoryKey = `${inventoryKeyRoot}_${_path[_path.length - 1]}`;
          } else {
            inventoryKey = _path[_path.length - 1];
          }

          inventoryPath = [bundleRoot, inventoryKey];
          if (has(bundledObj, inventoryPath)) {
            inventoryKey = `${inventoryKey}_1`;
            inventoryPath = [bundleRoot, inventoryKey];
          }

          inventoryRef = pathToPointer(inventoryPath);
        } catch (error) {
          errorsObj[$ref] = error.message;
        }

        // Ignore invalid $refs and carry on
        if (!_path || !inventoryPath || !inventoryRef) return;

        const bundled$Ref = get(document, _path);
        if (bundled$Ref !== void 0) {
          bundledRefInventory[$ref] = inventoryRef;
          parent.$ref = inventoryRef;

          if (!has(bundledObj, inventoryPath)) {
            const target = get(document, _path);
            if (Array.isArray(target)) {
              set(bundledObj, inventoryPath, new Array(target.length).fill(null));
            } else if (typeof target === 'object') {
              set(bundledObj, inventoryPath, {});
            }

            set(bundledObj, inventoryPath, bundled$Ref);

            if (!stack[$ref]) {
              stack[$ref] = true;
              _bundle(document, path, stack, bundled$Ref, bundledRefInventory, bundledObj, errorsObj);
              stack[$ref] = false;
            }
          }
        }
      }
    });

    set(objectToBundle, bundleRoot, bundledObj[bundleRoot]);

    if (Object.keys(errorsObj).length) {
      set(objectToBundle, errorsRoot, errorsObj);
    }

    return objectToBundle;
  };

  return _bundle;
};
