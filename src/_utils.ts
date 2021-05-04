/**
 * @hidden
 *
 * Internal helper for now.
 *
 * At some point, if we have enough string helpers, this might go in a string repo? Or this repo becomes more generic utils.
 */
export const replaceInString = (str: string, find: string, repl: string): string => {
  // modified from http://jsperf.com/javascript-replace-all/10
  const orig = str.toString();
  let res = '';
  let rem = orig;
  let beg = 0;
  let end = rem.indexOf(find);

  while (end > -1) {
    res += orig.substring(beg, beg + end) + repl;
    rem = rem.substring(end + find.length, rem.length);
    beg += end + find.length;
    end = rem.indexOf(find);
  }

  if (rem.length > 0) {
    res += orig.substring(orig.length - rem.length, orig.length);
  }

  return res;
};

export function isPlainObject(maybeObj: unknown): maybeObj is { [key in PropertyKey]: unknown } {
  if (typeof maybeObj !== 'object' || maybeObj === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(maybeObj);
  return proto === null || proto === Object.prototype;
}
