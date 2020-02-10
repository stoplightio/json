import { get, set } from 'lodash';

import { pointerToPath } from './pointerToPath';
import { traverse } from './traverse';

export const bundleTarget = ({ root, cur, path = '#/__target__' }: { root: any; cur?: any; path?: string }) => {
  const objectToBundle = get(root, pointerToPath(path));

  traverse(cur ? cur : objectToBundle, ({ property, propertyValue }) => {
    if (property === '$ref' && typeof propertyValue === 'string') {
      const _path = pointerToPath(propertyValue);
      const bundled$Ref = get(root, _path);
      const exists = !!get(objectToBundle, _path);
      if (bundled$Ref && !exists) {
        set(objectToBundle, _path, bundled$Ref);
        bundleTarget({
          root,
          cur: bundled$Ref,
        });
      }
    }
  });

  return objectToBundle;
};
