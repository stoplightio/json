// renames a key while trying to preserve key ordering
export const renameObjectKey = (obj: object, oldKey: string, newKey: string): object => {
  if (!obj || !Object.hasOwnProperty.call(obj, oldKey) || oldKey === newKey) {
    return obj;
  }

  const newObj: Record<string | number | symbol, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === oldKey) {
      newObj[newKey] = value;
    } else if (!(key in newObj)) {
      newObj[key] = value;
    }
  }

  return newObj;
};
