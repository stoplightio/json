import { JsonPath } from '@stoplight/types';

export const traverse = (
  obj: unknown,
  func: (opts: { parent: unknown; parentPath: JsonPath; property: string | number; propertyValue: unknown }) => void,
  path: JsonPath = [],
) => {
  if (!obj || typeof obj !== 'object') return;

  for (const i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    func({ parent: obj, parentPath: path, property: i, propertyValue: obj[i] });
    if (obj[i] && typeof obj[i] === 'object') {
      traverse(obj[i], func, path.concat(i));
    }
  }
};
