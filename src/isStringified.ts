export const isStringified = (val: unknown) => {
  if (typeof val !== 'string') {
    return false;
  }

  try {
    JSON.parse(val as string);
    return true;
  } catch {
    return false;
  }
};
