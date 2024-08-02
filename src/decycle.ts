import { isPlainObject } from './isPlainObject';
import { pathToPointer } from './pathToPointer';

export const decycle = (obj: unknown, replacer?: (value: any) => any) => {
  const objs = new WeakMap<object, string>();
  const processedObjs = new WeakSet<object>();

  return (function derez(value: any, path: string[]) {
    // The new object or array
    let curObj: any;

    // If a replacer function was provided, then call it to get a replacement value.
    if (replacer) value = replacer(value);

    if (isPlainObject(value) || Array.isArray(value)) {
      // The path of an earlier occurance of value
      const oldPath = objs.get(value);
      // If the value is an object or array, look to see if we have already
      // encountered it. If so, return a {"$ref":PATH} object.
      if (oldPath) return { $ref: oldPath };

      objs.set(value, pathToPointer(path));
      // If it is an array, replicate the array.
      if (Array.isArray(value)) {
        curObj = value.map((element, i) => derez(element, [...path, String(i)]));
      } else {
        // It is an object, replicate the object.
        curObj = {};
        Object.keys(value).forEach(name => {
          curObj[name] = derez(value[name], [...path, name]);
        });
      }
      if (!processedObjs.has(value)) {
        objs.delete(value);
      }
      processedObjs.add(value);
      return curObj;
    }
    return value;
  })(obj, []);
};
