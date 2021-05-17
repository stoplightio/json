export const isLocalRef = (pointer: string) => pointer.length > 0 && (pointer === '#' || /^#\/\S*$/.test(pointer));
