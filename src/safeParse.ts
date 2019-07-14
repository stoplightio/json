import { isFinite, toNumber, toString } from 'lodash';

export const safeParse: JSON['parse'] = <T>(
  text: string,
  reviver?: (key: any, value: any) => any,
): T | string | undefined => {
  if (typeof text !== 'string') return text;

  try {
    // if the number is parsed incorrectly return the original stringified num
    const num = parseNumber(text);
    if (typeof num === 'string') return num;

    return JSON.parse(text, reviver);
  } catch (e) {
    return void 0;
  }
};

const parseNumber = (string: string): number | string => {
  const numVal = toNumber(string);

  // For large number javascript maniuplates data, check if converted num is same as original
  if (isFinite(numVal)) {
    if (toString(numVal) === string) {
      return numVal;
    }

    return string;
  }

  return NaN;
};
