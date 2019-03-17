import { ILocation, IParserResult, IPosition, SourceMapParser } from '@stoplight/types/parsers';
import { IDiagnostic } from '@stoplight/types/validations';
import {
  findNodeAtLocation,
  findNodeAtOffset,
  getNodePath,
  getNodeValue,
  JSONPath,
  JSONVisitor,
  Node,
  NodeType,
  ParseError,
  ParseErrorCode,
  ParseOptions,
  visit,
} from 'jsonc-parser';

export const parseWithPointers: SourceMapParser = <T>(value: string): IParserResult<T> => {
  const diagnostics: IDiagnostic[] = [];
  const errors: ParseError[] = [];
  const { tree, linesMap } = parseTree(value, errors, { disallowComments: true });

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
      const node = findNodeAtLocation(tree, path) as INodeImpl;

      if (node === undefined) {
        return node;
      }

      return {
        uri: '',
        range: {
          start: {
            character: node.startColumn!,
            line: node.startLine!,
          },
          end: {
            character: node.endColumn!,
            line: node.endLine!,
          },
        },
      };
    },
  };
};

/**
 * Parses the given text and returns a tree representation the JSON content. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 */
export function parseTree(text: string, errors: ParseError[] = [], options: ParseOptions) {
  const linesMap = new Map<number, number>([[0, 0]]);
  let currentLineNumber = 0;
  let currentOffset = 0;
  let currentParent: INodeImpl = { type: 'array', offset: -1, length: -1, children: [], parent: void 0 }; // artificial root

  function ensurePropertyComplete(endOffset: number) {
    if (currentParent.type === 'property') {
      currentParent.length = endOffset - currentParent.offset;
      currentParent = currentParent.parent!;
    }
  }

  function calculateRange(offset: number, length: number) {
    const startColumn = offset - currentOffset;
    return {
      startColumn,
      startLine: currentLineNumber,
      endColumn: startColumn + length,
      endLine: currentLineNumber,
    };
  }

  function onValue(valueNode: INodeImpl): INodeImpl {
    currentParent.children!.push(valueNode);
    return valueNode;
  }

  const visitor: JSONVisitor = {
    onObjectBegin: (offset: number) => {
      currentParent = onValue({
        type: 'object',
        offset,
        length: -1,
        parent: currentParent,
        children: [],
        ...calculateRange(offset - 1, -1),
      });
    },
    onObjectProperty: (name: string, offset: number, length: number) => {
      currentParent = onValue({ type: 'property', offset, length: -1, parent: currentParent, children: [] });
      currentParent.children!.push({ type: 'string', value: name, offset, length, parent: currentParent });
    },
    onObjectEnd: (offset: number, length: number) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent.endColumn = offset - currentOffset;
      currentParent.endLine = currentLineNumber;
      currentParent = currentParent.parent!;
      ensurePropertyComplete(offset + length);
    },
    onArrayBegin: (offset: number, length: number) => {
      currentParent = onValue({
        type: 'array',
        offset,
        length: -1,
        parent: currentParent,
        children: [],
        ...calculateRange(offset - 1, -1),
      });
    },
    onArrayEnd: (offset: number, length: number) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent.endColumn = offset - currentOffset;
      currentParent.endLine = currentLineNumber;
      currentParent = currentParent.parent!;
      ensurePropertyComplete(offset + length);
    },
    onLiteralValue: (value: any, offset: number, length: number) => {
      onValue({
        type: getLiteralNodeType(value),
        offset,
        length,
        parent: currentParent,
        value,
        ...calculateRange(offset, length),
      });
      ensurePropertyComplete(offset + length);
    },
    onSeparator: (sep: string, offset: number, length: number) => {
      if (currentParent.type === 'property') {
        if (sep === ':') {
          currentParent.colonOffset = offset;
        } else if (sep === ',') {
          ensurePropertyComplete(offset);
        }
      }
    },
    onError: (error: ParseErrorCode, offset: number, length: number) => {
      errors.push({ error, offset, length });
    },
    onLineBreak: (lineNumber: number, offset: number) => {
      linesMap.set(lineNumber, offset);
      currentLineNumber = lineNumber;
      currentOffset = offset;
    },
  };
  visit(text, visitor, options);

  const result = currentParent.children![0];
  if (result) {
    delete result.parent;
  }
  return {
    tree: result,
    linesMap,
  };
}

function getLiteralNodeType(value: any): NodeType {
  switch (typeof value) {
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    default:
      return 'null';
  }
}

interface INodeImpl extends Node {
  type: NodeType;
  value?: any;
  offset: number;
  length: number;
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
  colonOffset?: number;
  parent?: INodeImpl;
  children?: INodeImpl[];
}
