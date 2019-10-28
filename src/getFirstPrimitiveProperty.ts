import { Optional } from '@stoplight/types';
import { createScanner, SyntaxKind } from 'jsonc-parser';

export const getFirstPrimitiveProperty = (text: string): Optional<[string, string | number | boolean | null]> => {
  const scanner = createScanner(text, true);

  scanner.scan();

  if (scanner.getToken() !== SyntaxKind.OpenBraceToken) {
    return;
  }

  scanner.scan();

  if (scanner.getToken() === SyntaxKind.CloseBraceToken) {
    return;
  }

  if (scanner.getToken() !== SyntaxKind.StringLiteral) {
    throw new SyntaxError('Unexpected character');
  }

  const property = scanner.getTokenValue();
  scanner.scan();

  if (scanner.getToken() !== SyntaxKind.ColonToken) {
    throw new SyntaxError('Colon expected');
  }

  scanner.scan();

  switch (scanner.getToken()) {
    case SyntaxKind.StringLiteral:
      return [property, scanner.getTokenValue()];
    case SyntaxKind.NumericLiteral:
      return [property, Number(scanner.getTokenValue())]; // note we should validate the number, but let's have a loose check
    case SyntaxKind.TrueKeyword:
      return [property, true];
    case SyntaxKind.FalseKeyword:
      return [property, false];
    case SyntaxKind.NullKeyword:
      return [property, null];
    default:
      return;
  }
};
