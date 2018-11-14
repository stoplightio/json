/**
 * Works on strings AND arrays, unlike native JS `x.startsWith()`.
 *
 * startsWith([1, 2], [1]) === true
 * startsWith([2, 3], [1]) === false
 * startsWith('123', '12') === true
 */
export const startsWith = (source: any[] | string, val: any[] | string): boolean => {
  if (source instanceof Array) {
    if (val instanceof Array) {
      if (val.length > source.length) return false;

      for (const i in val) {
        if (!val.hasOwnProperty(i)) continue;

        const si = parseInt(source[i]);
        const vi = parseInt(val[i]);

        // support if numeric index is stringified in one but not the other
        if (!isNaN(si) || !isNaN(vi)) {
          if (si !== vi) {
            return false;
          }
        } else if (source[i] !== val[i]) {
          return false;
        }
      }
    }
  } else if (typeof source === 'string') {
    if (typeof val === 'string') {
      return source.startsWith(val);
    }
  } else {
    return false;
  }

  return true;
};
