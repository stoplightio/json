import { cloneDeep, get, has, set } from 'lodash';

import { hasRef } from './hasRef';
import { isLocalRef } from './isLocalRef';
import { pathToPointer } from './pathToPointer';
import { pointerToPath } from './pointerToPath';
import { traverse } from './traverse';

export const BUNDLE_ROOT = '__bundled__';

export const bundleTarget = <T = unknown>({ document, path }: { document: T; path: string }, cur?: unknown) =>
  _bundle(cloneDeep(document), path, cur);

const _bundle = (
  document: unknown,
  path: string,
  cur?: unknown,
  bundledRefInventory: any = {},
  bundledObj: any = {},
) => {
  const objectToBundle = get(document, pointerToPath(path));

  traverse(cur ? cur : objectToBundle, ({ parent }) => {
    if (hasRef(parent) && isLocalRef(parent.$ref)) {
      if (bundledRefInventory[parent.$ref]) {
        parent.$ref = bundledRefInventory[parent.$ref];

        // no need to continue, this $ref has already been bundled
        return;
      }

      const _path = pointerToPath(parent.$ref);
      const inventoryPath = [BUNDLE_ROOT, ..._path];
      const inventoryRef = pathToPointer(inventoryPath);

      const bundled$Ref = get(document, _path);
      if (bundled$Ref) {
        const pathProcessed = [];

        bundledRefInventory[parent.$ref] = inventoryRef;
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
        _bundle(document, path, bundled$Ref, bundledRefInventory, bundledObj);
      }
    }
  });

  set(objectToBundle, BUNDLE_ROOT, bundledObj[BUNDLE_ROOT]);

  return objectToBundle;
};
