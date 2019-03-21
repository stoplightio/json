import { GetLocationForJsonPath } from '@stoplight/types';
import { findNodeAtLocation } from 'jsonc-parser';
import { IJsonASTNode } from './types';

export const getLocationForJsonPath: GetLocationForJsonPath<IJsonASTNode, Map<number, number>> = ({ lineMap, ast }, path) => {
  const node = findNodeAtLocation(ast, path) as IJsonASTNode;

  if (node === undefined) {
    return node;
  }

  return {
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
};
