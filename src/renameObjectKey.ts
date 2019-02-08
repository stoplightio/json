// renames a key while trying to preserve key ordering
export const renameObjectKey = (obj: object, oldKey: string, newKey: string) => {
  if (!obj || !obj[oldKey] || oldKey === newKey) {
    return obj;
  }

  const values = [];
  for (const key in obj) {
    if (key !== newKey) {
      values.push({
        name: key === oldKey ? newKey : key,
        value: obj[key],
      });
    }
  }

  const newObj = {};
  for (const value of values) {
    newObj[value.name] = value.value;
  }

  return newObj;
};
