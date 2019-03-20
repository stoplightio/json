import { DiagnosticSeverity, IDiagnostic } from '@stoplight/types/diagnostics';
import { IParserASTResult, IParserResult } from '@stoplight/types/parsers';
import { JSONVisitor, Node, NodeType, ParseErrorCode, ParseOptions, printParseErrorCode, visit } from 'jsonc-parser';
import { IJsonASTNode } from './types';

export const parseWithPointers = <T = unknown>(value: string): IParserResult<T, IJsonASTNode, Map<number, number>> => {
  const diagnostics: IDiagnostic[] = [];
  const { ast, data, lineMap } = parseTree<T>(value, diagnostics, { disallowComments: true });

  return {
    data,
    diagnostics,
    ast,
    lineMap,
  };
};

// based on source code of "https://github.com/Microsoft/node-jsonc-parser
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function parseTree<T>(
  text: string,
  errors: IDiagnostic[] = [],
  options: ParseOptions
): IParserASTResult<T, Node, Map<number, number>> {
  const lineMap: Map<number, number> = new Map([[0, 0]]);
  let currentLineNumber = 0;
  let currentOffset = 0;
  let lastErrorEndOffset = -1;
  let currentParent: IJsonASTNode = { type: 'array', offset: -1, length: -1, children: [], parent: void 0 }; // artificial root
  let currentParsedProperty: string | null = null;
  let currentParsedParent: any = [];
  const previousParsedParents: any[] = [];

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

  function onValue(valueNode: IJsonASTNode): IJsonASTNode {
    currentParent.children!.push(valueNode);
    return valueNode;
  }

  function onParsedValue(value: any) {
    if (Array.isArray(currentParsedParent)) {
      (currentParsedParent as any[]).push(value);
    } else if (currentParsedProperty) {
      currentParsedParent[currentParsedProperty] = value;
    }
  }

  function onParsedComplexBegin(value: any) {
    onParsedValue(value);
    previousParsedParents.push(currentParsedParent);
    currentParsedParent = value;
    currentParsedProperty = null;
  }

  function onParsedComplexEnd() {
    currentParsedParent = previousParsedParents.pop();
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

      onParsedComplexBegin({});
    },
    onObjectProperty: (name: string, offset: number, length: number) => {
      currentParent = onValue({ type: 'property', offset, length: -1, parent: currentParent, children: [] });
      currentParent.children!.push({ type: 'string', value: name, offset, length, parent: currentParent });

      currentParsedProperty = name;
    },
    onObjectEnd: (offset: number, length: number) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent.endColumn = offset - currentOffset;
      currentParent.endLine = currentLineNumber;
      currentParent = currentParent.parent!;
      ensurePropertyComplete(offset + length);

      onParsedComplexEnd();
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

      onParsedComplexBegin([]);
    },
    onArrayEnd: (offset: number, length: number) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent.endColumn = offset - currentOffset;
      currentParent.endLine = currentLineNumber;
      currentParent = currentParent.parent!;
      ensurePropertyComplete(offset + length);

      onParsedComplexEnd();
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

      onParsedValue(value);
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
      const range = calculateRange(offset, length);
      lastErrorEndOffset = offset + length;
      errors.push({
        range: {
          start: {
            character: range.startColumn,
            line: range.startLine,
          },
          end: {
            character: range.endColumn,
            line: range.startLine,
          },
        },
        message: printParseErrorCode(error),
        severity: DiagnosticSeverity.Error,
        code: error,
      });
    },
    onLineBreak: (lineNumber: number, offset: number) => {
      lineMap.set(lineNumber, offset);
      currentLineNumber = lineNumber;
      currentOffset = offset;
      if (lastErrorEndOffset !== -1 && offset > lastErrorEndOffset) {
        // @ts-ignore read-only
        errors[errors.length - 1].range.end.line = lineNumber - 1;
        // @ts-ignore read-only
        errors[errors.length - 1].range.end.character = offset - lastErrorEndOffset;
        lastErrorEndOffset = -1;
      }
    },
  };
  visit(text, visitor, options);

  const result = currentParent.children![0];
  if (result) {
    delete result.parent;
  }
  return {
    ast: result,
    data: currentParsedParent[0],
    lineMap,
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
