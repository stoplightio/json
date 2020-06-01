import { cloneDeep, get, has, set } from 'lodash';

import { isLocalRef } from './isLocalRef';
import { pointerToPath } from './pointerToPath';
import { traverse } from './traverse';

export const bundleTarget = <T = unknown>({ document, path }: { document: T; path: string }, cur?: unknown) =>
  _bundle(cloneDeep(document), path, cur);

const _bundle = (document: unknown, path: string, cur?: unknown) => {
  const objectToBundle = get(document, pointerToPath(path));

  traverse(cur ? cur : objectToBundle, ({ property, propertyValue }) => {
    if (property === '$ref' && typeof propertyValue === 'string' && isLocalRef(propertyValue)) {
      const _path = pointerToPath(propertyValue);
      const bundled$Ref = get(document, _path);
      const exists = has(objectToBundle, _path);
      if (bundled$Ref && !exists) {
        const pathProcessed = [];

        // make sure arrays and object decisions are preserved when copying over the portion of the tree
        for (const key of _path) {
          pathProcessed.push(key);

          if (has(objectToBundle, pathProcessed)) continue;

          const target = get(document, pathProcessed);
          if (Array.isArray(target)) {
            set(objectToBundle, pathProcessed, []);
          } else if (typeof target === 'object') {
            set(objectToBundle, pathProcessed, {});
          }
        }

        set(objectToBundle, _path, bundled$Ref);
        _bundle(document, path, bundled$Ref);
      }
    }
  });

  return objectToBundle;
};
