export function isPlainObject(maybeObj: unknown): maybeObj is Record<PropertyKey, unknown> {
  if (typeof maybeObj !== 'object' || maybeObj === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(maybeObj);
  return (
    proto === null ||
    proto === Object.prototype ||
    // this is to be more compatible with Lodash.isPlainObject that also checks the constructor
    (typeof maybeObj.constructor === 'function' &&
      Function.toString.call(Object) === Function.toString.call(maybeObj.constructor))
  );
}
