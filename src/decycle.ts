import { isPlainObject } from './isPlainObject';
import { pathToPointer } from './pathToPointer';

export function decycle(obj: unknown, replacer?: (value: any) => any) {
  const objs = new WeakMap<object, string>();
  function derez(value: any, path: (string | number)[]): any {
    if (replacer) {
      value = replacer(value);
    }

    if (isPlainObject(value) || Array.isArray(value)) {
      const oldPath = objs.get(value);

      if (oldPath) {
        return { $ref: oldPath };
      }

      objs.set(value, pathToPointer(path));

      if (Array.isArray(value)) {
        return value.map((element, i) => derez(element, [...path, i]));
      }

      const newObj: Record<string, any> = {};
      for (const name in value) {
        if (Object.prototype.hasOwnProperty.call(value, name)) {
          newObj[name] = derez(value[name], [...path, name]);
        }
      }
      objs.delete(value);
      return newObj;
    }

    return value;
  }

  return derez(obj, []);
}
