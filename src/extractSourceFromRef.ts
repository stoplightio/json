import { isLocalRef } from './isLocalRef';

export const extractSourceFromRef = (ref: unknown): string | null => {
  if (typeof ref !== 'string' || ref.length === 0 || isLocalRef(ref)) {
    return null;
  }

  const index = ref.indexOf('#');
  return index === -1 ? ref : ref.slice(0, index);
};
