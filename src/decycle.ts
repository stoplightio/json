export const decycle = (obj: unknown, replacer?: (value: any) => any) => {
  const objs = new WeakMap();
  return (function derez(value: any, path: string) {
    // The path of an earlier occurance of value
    let oldPath: string;
    // The new object or array
    let curObj: any;

    // If a replacer function was provided, then call it to get a replacement value.
    if (replacer) value = replacer(value);

    if ([null, Object.prototype].includes(Object.getPrototypeOf(value)) || Array.isArray(value)) {
      // If the value is an object or array, look to see if we have already
      // encountered it. If so, return a {"$ref":PATH} object.
      oldPath = objs.get(value);
      if (oldPath) return { $ref: oldPath };

      objs.set(value, path);
      // If it is an array, replicate the array.
      if (Array.isArray(value)) {
        curObj = [];
        value.forEach((element, i) => {
          curObj[i] = derez(element, `${path}/${i}`);
        });
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
