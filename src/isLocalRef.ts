export const isLocalRef = (pointer: string) => pointer.length > 0 && /^#\/?\S*$/.test(pointer);
