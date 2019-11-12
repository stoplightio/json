import { ParseOptions } from 'jsonc-parser';
import { DEFAULT_PARSE_OPTIONS, parseTree } from './parseWithPointers';

export const parse = (value: string, options: ParseOptions = DEFAULT_PARSE_OPTIONS): unknown =>
  parseTree(value, void 0, options).data;
