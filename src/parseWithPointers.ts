import { IParserResult, IParserResultPointers, SourceMapParser } from '@stoplight/types/parsers';

// @ts-ignore
import * as jsonSourceMap from 'json-source-map';

export const parseWithPointers: SourceMapParser = <T>(value: string): IParserResult<T> => {
  const parsed: IParserResult<T> = {
    data: {} as T,
    pointers: {},
    validations: [],
  };

  if (!value || !value.trim().length) return parsed;

  const result = jsonSourceMap.parse(value);
  parsed.data = result.data;
  parsed.pointers = transformPointers(result.pointers);

  return parsed;
};

const transformPointers = (pointers: any) => {
  const transformed: IParserResultPointers = {};

  for (const path in pointers) {
    if (!pointers.hasOwnProperty(path)) continue;

    transformed[path] = {
      start: {
        // json-source-map is zero-based
        line: pointers[path].value.line + 1,
      },
      end: {
        // json-source-map is zero-based
        line: pointers[path].valueEnd.line + 1,
      },
    };
  }

  return transformed;
};
