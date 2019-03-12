/*
Right now the parseWithPointers function doesn't make use of parse function exposed by jsonc-parser.
The reason we had to fall back to tokenizer is quite simple - lines and columns.
jsonc-parser doesn't expose any onNewLine hook, so the only piece of information we are given is offset and length,
which are not sufficient to build the list of pointers.
That's why we had to bring the parse function in and modify it to let us have the pointers with correct location.

We should get rid of the current implementation of it. There are 2 ways to accomplish this:
- either use offsets + lengths provided by jsonc-parser (would require changes to yaml/markdown parsers, related story SL-1958)
or
- create a PR with onNewLine hook

Related task to address the issue: SL-2039
 */
import { IParserResult, SourceMapParser } from '@stoplight/types/parsers';
import { IValidationResult, ValidationSeverity, ValidationSeverityLabel } from '@stoplight/types/validations';
import {
  createScanner,
  JSONPath,
  JSONVisitor,
  ParseErrorCode,
  ParseOptions,
  printParseErrorCode,
  ScanError,
  Segment,
  SyntaxKind,
} from 'jsonc-parser';
import { encodePointerFragment } from './encodePointerFragment';

export const parseWithPointers: SourceMapParser = <T>(value: string): IParserResult<T> => {
  const parsed: IParserResult<T> = {
    data: {} as T,
    pointers: {},
    validations: [],
  };

  if (!value || !value.trim().length) return parsed;

  const validations: IValidationResult[] = [];

  return {
    ...parse(value, validations, {
      disallowComments: true,
    }),
    validations,
  };
};

// based on jsonc-parser source code
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

interface IJSONVisitor extends JSONVisitor {
  onNewLine?: (lineNumber: ParseErrorCode, offset: number, length: number) => void;
}

function toPointer(fragments: Segment[]) {
  return ['', ...fragments.filter(item => item !== '')].join('/');
}

/**
 * Parses the given text and returns the object the JSON content represents. On invalid input, the parser tries to be as fault tolerant as possible, but still return a result.
 * Therefore always check the errors list to find out if the input was valid.
 */
function parse(text: string, errors: IValidationResult[] = [], options?: ParseOptions): any {
  let currentProperty: string | null = null;
  let currentParent: any = [];
  let currentLineNumber = 1;
  const offsets: number[] = [];
  const previousParents: any[] = [];
  const previousPointers: JSONPath = [];
  const pointers = {
    '': {
      start: {
        line: 1,
      },
      end: {
        line: 0,
      },
    },
  };

  function onValue(value: any) {
    if (Array.isArray(currentParent)) {
      const index = (currentParent as any[]).push(value) - 1;

      if (previousParents.length > 0) {
        pointers[toPointer([...previousPointers.slice(0, previousPointers.length - 1), index])] = {
          start: {
            line: currentLineNumber,
          },
          end: {
            line: typeof value !== 'object' ? currentLineNumber : 0,
          },
        };
      }
    } else if (currentProperty) {
      currentParent[currentProperty] = value;

      pointers[toPointer(previousPointers)] = {
        start: {
          line: currentLineNumber,
        },
        end: {
          line: typeof value !== 'object' ? currentLineNumber : 0,
        },
      };
    }
  }

  function onComplexValueEnd(value: object) {
    const previousPointersCopy = [...previousPointers];
    if (value === currentParent) {
      previousPointersCopy.pop();
    }

    const pointer = pointers[toPointer(previousPointersCopy)];
    if (pointer && pointer.end.line === 0) {
      pointer.end.line = currentLineNumber;
    }
  }

  const visitor: IJSONVisitor = {
    onObjectBegin: () => {
      const object = {};
      onValue(object);
      if (Array.isArray(currentParent) && previousPointers.length > 0) {
        if (previousPointers[previousPointers.length - 1] === '') {
          previousPointers[previousPointers.length - 1] = 0;
        } else {
          previousPointers[previousPointers.length - 1] = Number(previousPointers[previousPointers.length - 1]) + 1;
        }
      }

      previousPointers.push('');
      previousParents.push(currentParent);
      currentParent = object;
      currentProperty = null;
    },
    onObjectProperty: (name: string) => {
      currentProperty = name;
      previousPointers[previousPointers.length - 1] = encodePointerFragment(name);
    },
    onObjectEnd: () => {
      onComplexValueEnd(currentParent);
      previousPointers.pop();
      currentParent = previousParents.pop();
    },
    onArrayBegin: () => {
      const array: any[] = [];
      onValue(array);
      previousPointers.push('');
      previousParents.push(currentParent);
      currentParent = array;
      currentProperty = null;
    },
    onArrayEnd: () => {
      onComplexValueEnd(currentParent);
      previousPointers.pop();
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: (error: ParseErrorCode, offset: number, length: number) => {
      const startColumn = offset - offsets[currentLineNumber - 2];
      errors.push({
        errorCode: error,
        name: printParseErrorCode(error),
        severity: ValidationSeverity.Error,
        severityLabel: ValidationSeverityLabel.Error,
        location: {
          start: {
            line: currentLineNumber,
            column: startColumn,
          },
          end: {
            line: currentLineNumber,
            column: startColumn + length,
          },
        },
        offset,
        length,
      });
    },
    onNewLine(lineNumber, offset, length) {
      currentLineNumber = lineNumber;
      offsets.push(offset);
    },
  };
  visit(text, visitor, options);

  return {
    pointers,
    data: currentParent[0],
  };
}

/**
 * Parses the given text and invokes the visitor functions for each object, array and literal reached.
 */
function visit(text: string, visitor: IJSONVisitor, options?: ParseOptions): any {
  const _scanner = createScanner(text, false);
  // not 0-index based on purpose
  let lineNumber = 1;

  function toNoArgVisit(visitFunction?: (offset: number, length: number) => void): () => void {
    return visitFunction ? () => visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
  }
  function toOneArgVisit<T>(visitFunction?: (arg: T, offset: number, length: number) => void): (arg: T) => void {
    return visitFunction
      ? (arg: T) => visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength())
      : () => true;
  }

  const onObjectBegin = toNoArgVisit(visitor.onObjectBegin);
  const onObjectProperty = toOneArgVisit(visitor.onObjectProperty);
  const onObjectEnd = toNoArgVisit(visitor.onObjectEnd);
  const onArrayBegin = toNoArgVisit(visitor.onArrayBegin);
  const onArrayEnd = toNoArgVisit(visitor.onArrayEnd);
  const onLiteralValue = toOneArgVisit(visitor.onLiteralValue);
  const onSeparator = toOneArgVisit(visitor.onSeparator);
  const onComment = toNoArgVisit(visitor.onComment);
  const onError = toOneArgVisit(visitor.onError);
  const onNewLine = toOneArgVisit(visitor.onNewLine);

  const disallowComments = options && options.disallowComments;
  const allowTrailingComma = options && options.allowTrailingComma;

  function scanNext(): SyntaxKind {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case ScanError.InvalidUnicode:
          handleError(ParseErrorCode.InvalidUnicode);
          break;
        case ScanError.InvalidEscapeCharacter:
          handleError(ParseErrorCode.InvalidEscapeCharacter);
          break;
        case ScanError.UnexpectedEndOfNumber:
          handleError(ParseErrorCode.UnexpectedEndOfNumber);
          break;
        case ScanError.UnexpectedEndOfComment:
          if (!disallowComments) {
            handleError(ParseErrorCode.UnexpectedEndOfComment);
          }
          break;
        case ScanError.UnexpectedEndOfString:
          handleError(ParseErrorCode.UnexpectedEndOfString);
          break;
        case ScanError.InvalidCharacter:
          handleError(ParseErrorCode.InvalidCharacter);
          break;
      }
      switch (token) {
        case SyntaxKind.LineCommentTrivia:
        case SyntaxKind.BlockCommentTrivia:
          if (disallowComments) {
            handleError(ParseErrorCode.InvalidCommentToken);
          } else {
            onComment();
          }
          break;
        case SyntaxKind.Unknown:
          handleError(ParseErrorCode.InvalidSymbol);
          break;
        case SyntaxKind.Trivia:
          break;
        case SyntaxKind.LineBreakTrivia:
          onNewLine(++lineNumber);
          break;
        default:
          return token;
      }
    }
  }

  function handleError(error: ParseErrorCode, skipUntilAfter: SyntaxKind[] = [], skipUntil: SyntaxKind[] = []): void {
    onError(error);

    if (skipUntilAfter.length + skipUntil.length > 0) {
      let token = _scanner.getToken();
      while (token !== SyntaxKind.EOF) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }

  function parseString(isValue: boolean): boolean {
    const value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
    }
    scanNext();
    return true;
  }

  function parseLiteral(): boolean {
    switch (_scanner.getToken()) {
      case SyntaxKind.NumericLiteral:
        let value = 0;
        try {
          value = JSON.parse(_scanner.getTokenValue());
          if (typeof value !== 'number') {
            handleError(ParseErrorCode.InvalidNumberFormat);
            value = 0;
          }
        } catch (e) {
          handleError(ParseErrorCode.InvalidNumberFormat);
        }
        onLiteralValue(value);
        break;
      case SyntaxKind.NullKeyword:
        onLiteralValue(null);
        break;
      case SyntaxKind.TrueKeyword:
        onLiteralValue(true);
        break;
      case SyntaxKind.FalseKeyword:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }

  function parseProperty(): boolean {
    if (_scanner.getToken() !== SyntaxKind.StringLiteral) {
      handleError(ParseErrorCode.PropertyNameExpected, [], [SyntaxKind.CloseBraceToken, SyntaxKind.CommaToken]);
      return false;
    }
    parseString(false);
    if (_scanner.getToken() === SyntaxKind.ColonToken) {
      onSeparator(':');
      scanNext(); // consume colon

      if (!parseValue()) {
        handleError(ParseErrorCode.ValueExpected, [], [SyntaxKind.CloseBraceToken, SyntaxKind.CommaToken]);
      }
    } else {
      handleError(ParseErrorCode.ColonExpected, [], [SyntaxKind.CloseBraceToken, SyntaxKind.CommaToken]);
    }
    return true;
  }

  function parseObject(): boolean {
    onObjectBegin();
    scanNext(); // consume open brace

    let needsComma = false;
    while (_scanner.getToken() !== SyntaxKind.CloseBraceToken && _scanner.getToken() !== SyntaxKind.EOF) {
      if (_scanner.getToken() === SyntaxKind.CommaToken) {
        if (!needsComma) {
          handleError(ParseErrorCode.ValueExpected, [], []);
        }
        onSeparator(',');
        scanNext(); // consume comma
        if (_scanner.getToken() === SyntaxKind.CloseBraceToken && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(ParseErrorCode.CommaExpected, [], []);
      }
      if (!parseProperty()) {
        handleError(ParseErrorCode.ValueExpected, [], [SyntaxKind.CloseBraceToken, SyntaxKind.CommaToken]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== SyntaxKind.CloseBraceToken) {
      handleError(ParseErrorCode.CloseBraceExpected, [SyntaxKind.CloseBraceToken], []);
    } else {
      scanNext(); // consume close brace
    }
    return true;
  }

  function parseArray(): boolean {
    onArrayBegin();
    scanNext(); // consume open bracket

    let needsComma = false;
    while (_scanner.getToken() !== SyntaxKind.CloseBracketToken && _scanner.getToken() !== SyntaxKind.EOF) {
      if (_scanner.getToken() === SyntaxKind.CommaToken) {
        if (!needsComma) {
          handleError(ParseErrorCode.ValueExpected, [], []);
        }
        onSeparator(',');
        scanNext(); // consume comma
        if (_scanner.getToken() === SyntaxKind.CloseBracketToken && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(ParseErrorCode.CommaExpected, [], []);
      }
      if (!parseValue()) {
        handleError(ParseErrorCode.ValueExpected, [], [SyntaxKind.CloseBracketToken, SyntaxKind.CommaToken]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (_scanner.getToken() !== SyntaxKind.CloseBracketToken) {
      handleError(ParseErrorCode.CloseBracketExpected, [SyntaxKind.CloseBracketToken], []);
    } else {
      scanNext(); // consume close bracket
    }
    return true;
  }

  function parseValue(): boolean {
    switch (_scanner.getToken()) {
      case SyntaxKind.OpenBracketToken:
        return parseArray();
      case SyntaxKind.OpenBraceToken:
        return parseObject();
      case SyntaxKind.StringLiteral:
        return parseString(true);
      default:
        return parseLiteral();
    }
  }

  scanNext();
  if (_scanner.getToken() === SyntaxKind.EOF) {
    return true;
  }
  if (!parseValue()) {
    handleError(ParseErrorCode.ValueExpected, [], []);
    return false;
  }
  if (_scanner.getToken() !== SyntaxKind.EOF) {
    handleError(ParseErrorCode.EndOfFileExpected, [], []);
  }
  return true;
}
