import { isPlainObject } from './_utils';
import { encodePointer } from './encodePointer';

export const decycle = (obj: unknown, replacer?: (value: any) => any) => {
  const objs = new WeakMap<object, string>();
  return (function derez(value: any, path: string) {
    // The new object or array
    let curObj: any;

    // If a replacer function was provided, then call it to get a replacement value.
    if (replacer) value = replacer(value);

    if (isPlainObject(value) || Array.isArray(value)) {
      // The path of an earlier occurance of value
      const oldPath = objs.get(value);
      // If the value is an object or array, look to see if we have already
      // encountered it. If so, return a {"$ref":PATH} object.
      if (oldPath) return { $ref: encodePointer(oldPath) };

      objs.set(value, path);
      // If it is an array, replicate the array.
      if (Array.isArray(value)) {
        curObj = value.map((element, i) => derez(element, `${path}/${i}`));
      } else {
        // It is an object, replicate the object.
        curObj = {};
        Object.keys(value).forEach(name => {
          curObj[name] = derez(value[name], `${path}/${name}`);
        });
      }
      return curObj;
    }
    return value;
  })(obj, '#');
};
