import { isPlainObject } from './isPlainObject';
import { pathToPointer } from './pathToPointer';

export function decycle(obj: unknown, replacer?: (value: any) => any) {
  const objs = new WeakMap<object, string>();
  const objectsToBeDeleted: object[] = []; // To keep track of objects to delete later

  function derez(value: any, path: (string | number)[]): any {
    if (replacer) {
      value = replacer(value);
    }
    if (isPlainObject(value) || Array.isArray(value)) {
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
      // Schedule object for deletion after derez completes
      objectsToBeDeleted.push(value);
      return newObj;
    }
    return value;
  }

  const result = derez(obj, []);

  // Clean up objs for objects that were processed
  objectsToBeDeleted.forEach(obj => {
    objs.delete(obj);
  });

  return result;
}
