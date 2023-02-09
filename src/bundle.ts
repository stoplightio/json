import { Dictionary, JsonPath } from '@stoplight/types';
import { cloneDeep, get, has, set, setWith } from 'lodash';

import { hasRef } from './hasRef';
import { isLocalRef } from './isLocalRef';
import { pathToPointer } from './pathToPointer';
import { pointerToPath } from './pointerToPath';
import { resolveInlineRef } from './resolvers/resolveInlineRef';
import { traverse } from './traverse';

export const BUNDLE_ROOT = '#/__bundled__';
export const ERRORS_ROOT = '#/__errors__';

type KeyProviderFn = (props: { document: unknown; path: JsonPath }) => string | void | undefined | null;

export const bundleTarget = <T = unknown>(
  {
    document,
    path,
    bundleRoot = BUNDLE_ROOT,
    errorsRoot = ERRORS_ROOT,
    cloneDocument = true,
    keyProvider,
  }: {
    document: T;
    path: string;
    bundleRoot?: string;
    errorsRoot?: string;
    cloneDocument?: boolean;
    keyProvider?: KeyProviderFn;
  },
  cur?: unknown,
) => {
  if (path === bundleRoot || path === errorsRoot) {
    throw new Error(`Roots do not make any sense`);
  }

  const workingDocument = cloneDocument ? cloneDeep(document) : document;
  return bundle(
    workingDocument,
    pointerToPath(bundleRoot),
    pointerToPath(errorsRoot),
    keyProvider,
  )(path, { [path]: true }, cur);
};

const defaultKeyProvider = ({ document, path }: { document: unknown; path: JsonPath }) => {
  if (Array.isArray(get(document, path.slice(0, -1)))) {
    const inventoryKeyRoot = path[path.length - 2];
    return `${inventoryKeyRoot}_${path[path.length - 1]}`;
  } else {
    return String(path[path.length - 1]);
  }
};

const bundle = (document: unknown, bundleRoot: JsonPath, errorsRoot: JsonPath, keyProvider?: KeyProviderFn) => {
  const takenKeys = new Set<string | number>();

  const _bundle = (
    path: string,
    stack: Dictionary<boolean>,
    cur?: unknown,
    bundledRefInventory: any = {},
    bundledObj: any = {},
    errorsObj: any = {},
  ) => {
    const $refTarget = pointerToPath(path);
    const objectToBundle = get(document, $refTarget);

    traverse(cur ? cur : objectToBundle, {
      onEnter: ({ value: parent }) => {
        if (hasRef(parent) && isLocalRef(parent.$ref)) {
          if (parent.$ref === '#') {
            throw new Error('it is never OK to reference the document itself from within the document');
          }

          const $ref = parent.$ref;
          if (errorsObj[$ref]) return;

          if ($ref === path) {
            bundledRefInventory[$ref] = '#';
          }

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
            if (keyProvider) {
              _inventoryKey = keyProvider({ document, path: _path });
            }

            if (!_inventoryKey) {
              _inventoryKey = defaultKeyProvider({ document, path: _path });
            }

            inventoryKey = _inventoryKey;

            let i = 1;
            while (takenKeys.has(inventoryKey)) {
              i++;
              inventoryKey = `${_inventoryKey}_${i}`;

              if (i > 20) {
                throw new Error(`Keys ${_inventoryKey}_2 through ${_inventoryKey}_${20} already taken.`);
              }
            }

            takenKeys.add(inventoryKey);

            inventoryPath = [...bundleRoot, inventoryKey];

            inventoryRef = pathToPointer(inventoryPath);
          } catch (error) {
            errorsObj[$ref] = error instanceof Error ? error.message : String(error);
          }

          // Ignore invalid $refs and carry on
          if (!_path || !inventoryPath || !inventoryRef) return;

          let bundled$Ref: unknown;
          if (typeof document === 'object' && document !== null) {
            // check the simple way first, to preserve these relationships when possible
            bundled$Ref = get(document, _path);

            if (!bundled$Ref) {
              try {
                // if we could not find it with a simple lookup, check for deep refs etc via resolveInlineRef
                bundled$Ref = resolveInlineRef(Object(document), $ref);
              } catch {}
            }
          }

          if (bundled$Ref !== void 0) {
            bundledRefInventory[$ref] = inventoryRef;
            parent.$ref = inventoryRef;

            if (!has(bundledObj, inventoryPath)) {
              if (Array.isArray(bundled$Ref)) {
                set(bundledObj, inventoryPath, new Array(bundled$Ref.length).fill(null));
              } else if (typeof bundled$Ref === 'object') {
                setWith(bundledObj, inventoryPath, {}, Object);
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
      },
    });

    const finalObjectToBundle = get(bundledObj, bundleRoot);

    if (finalObjectToBundle && Object.keys(finalObjectToBundle).length) {
      set(objectToBundle, bundleRoot, finalObjectToBundle);
    }

    if (Object.keys(errorsObj).length || has(document, errorsRoot)) {
      set(objectToBundle, errorsRoot, has(document, errorsRoot) ? get(document, errorsRoot) : errorsObj);
    }

    return objectToBundle;
  };

  return _bundle;
};
