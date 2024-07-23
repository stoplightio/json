import { isPlainObject } from './isPlainObject';
import { pathToPointer } from './pathToPointer';

export function decycle(obj: unknown, replacer?: (value: any) => any) {
  const objs = new WeakMap<object, string>();
  function derez(value: any, path: (string | number)[]): any {
    if (replacer) {
      value = replacer(value);
    }

    if (isPlainObject(value) || Array.isArray(value)) {
      // The path of an earlier occurance of value
      const oldPath = objs.get(value);

      // If the value is an object or array, look to see if we have already
      // encountered it. If so, return a {"$ref":PATH} object.
      if (oldPath) {
        return { $ref: oldPath };
      }

      objs.set(value, pathToPointer(path));
      // If it is an array, replicate the array.
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
