// renames a key while trying to preserve key ordering
export const renameObjectKey = (obj: object, oldKey: string, newKey: string) => {
  if (!obj || !Object.hasOwnProperty.call(obj, oldKey) || oldKey === newKey) {
    return obj;
  }

  const newObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === oldKey) {
      newObj[newKey] = value;
    } else if (!(key in newObj)) {
      newObj[key] = value;
    }
  }

  return newObj;
};
