import { ILocation, IParserResult, IPosition, SourceMapParser } from '@stoplight/types/parsers';
import { IDiagnostic } from '@stoplight/types/validations';
import {
  // findNodeAtLocation,
  findNodeAtOffset,
  getNodePath,
  getNodeValue,
  JSONPath,
  ParseError,
  parseTree,
  visit,
} from 'jsonc-parser';

export const parseWithPointers: SourceMapParser = <T>(value: string): IParserResult<T> => {
  const diagnostics: IDiagnostic[] = [];
  const errors: ParseError[] = [];
  const tree = parseTree(value, errors, { disallowComments: true });
  const linesMap = new Map<number, number>();

  visit(value, {
    onLineBreak(lineNumber, offset) {
      linesMap.set(lineNumber, offset);
    },
  });

  return {
    data: getNodeValue(tree),
    diagnostics,

    getJsonPathForPosition(position: IPosition): JSONPath | undefined {
      const startOffset = linesMap.get(position.line);
      const endOffset = linesMap.get(position.line + 1);
      if (startOffset === undefined) {
        return;
      }

      const node = findNodeAtOffset(
        tree,
        endOffset === undefined
          ? startOffset + position.character
          : Math.min(endOffset, startOffset + position.character)
      );
      if (node === undefined) {
        return;
      }

      return getNodePath(node);
    },
    getLocationForJsonPath(path: JSONPath): ILocation | undefined {
      return undefined;
      // findNodeAtLocation(tree, path);
    },
  };
};
