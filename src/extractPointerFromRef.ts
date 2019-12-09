export const extractPointerFromRef = (ref: string): string | null => {
  if (typeof ref !== 'string' || ref.length === 0) {
    return null;
  }

  const index = ref.indexOf('#');
  return index === -1 ? null : ref.slice(index);
};
