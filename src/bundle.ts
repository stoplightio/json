import { cloneDeep, get, has, set } from 'lodash';

import { Dictionary } from '@stoplight/types';
import { hasRef } from './hasRef';
import { isLocalRef } from './isLocalRef';
import { pathToPointer } from './pathToPointer';
import { pointerToPath } from './pointerToPath';
import { traverse } from './traverse';

export const BUNDLE_ROOT = '#/__bundled__';
export const ERRORS_ROOT = '#/__errors__';

export const bundleTarget = <T = unknown>(
  {
    document,
    path,
    bundleRoot = BUNDLE_ROOT,
    errorsRoot = ERRORS_ROOT,
  }: { document: T; path: string; bundleRoot?: string; errorsRoot?: string },
  cur?: unknown,
) => {
  if (`${path}/`.startsWith(`${bundleRoot}/`) || `${path}/`.startsWith(`${errorsRoot}/`)) {
    throw new Error(`Roots do not make any sense`);
  }

  return bundle(cloneDeep(document), bundleRoot, errorsRoot)(path, { [path]: true }, cur);
};

const bundle = (document: unknown, bundleRoot: string, errorsRoot: string) => {
  const bundleRootPath = pointerToPath(bundleRoot);
  const errorsRootPath = pointerToPath(errorsRoot);
  const scopedBundledObj = get(document, bundleRootPath);

  const takenKeys = new Set<string | number>(
    typeof scopedBundledObj === 'object' && scopedBundledObj !== null ? [...Object.keys(scopedBundledObj)] : [],
  );

  const _bundle = (
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
        let inventoryKey;
        let inventoryRef;

        try {
          _path = pointerToPath($ref);

          let _inventoryKey;

          if (Array.isArray(get(document, _path.slice(0, -1)))) {
            const inventoryKeyRoot = _path[_path.length - 2];
            _inventoryKey = `${inventoryKeyRoot}_${_path[_path.length - 1]}`;
          } else {
            _inventoryKey = _path[_path.length - 1];
          }

          inventoryKey = _inventoryKey;

          if (!$ref.startsWith(bundleRoot)) {
            let i = 1;
            while (takenKeys.has(inventoryKey)) {
              i++;
              inventoryKey = `${_inventoryKey}_${i}`;

              if (i > 20) {
                throw new Error(`Keys ${_inventoryKey}_2 through ${_inventoryKey}_${20} already taken.`);
              }
            }

            takenKeys.add(inventoryKey);
          }

          inventoryPath = [...bundleRootPath, inventoryKey];

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
              _bundle(path, stack, bundled$Ref, bundledRefInventory, bundledObj, errorsObj);
              stack[$ref] = false;
            }
          }
        }
      }
    });

    const finalObjectToBundle = {
      ...scopedBundledObj,
      ...get(bundledObj, bundleRootPath),
    };

    if (Object.keys(finalObjectToBundle).length) {
      set(objectToBundle, bundleRootPath, finalObjectToBundle);
    }

    if (Object.keys(errorsObj).length || has(document, errorsRootPath)) {
      set(objectToBundle, errorsRootPath, has(document, errorsRootPath) ? get(document, errorsRootPath) : errorsObj);
    }

    return objectToBundle;
  };

  return _bundle;
};
