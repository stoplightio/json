import { GetLocationForJsonPath, ILocation } from '@stoplight/types';
import { findNodeAtLocation } from 'jsonc-parser';
import { lineForPosition } from './lineForPosition';
import { IJsonASTNode } from './types';

export const getLocationForJsonPath: GetLocationForJsonPath<IJsonASTNode, number[]> = ({ lineMap, ast }, path) => {
  const node = findNodeAtLocation(ast, path) as IJsonASTNode;

  if (node === undefined) {
    return;
  }

  if (node.range !== undefined) {
    return { range: node.range };
  }

  return getLoc(lineMap, { start: node.offset, end: node.offset + node.length });
};

const getLoc = (lineMap: number[], { start = 0, end = 0 }): ILocation => {
  const startLine = lineForPosition(start, lineMap);
  const endLine = lineForPosition(end, lineMap);
  return {
    range: {
      start: {
        line: startLine,
        character: start - (startLine === 0 ? 0 : lineMap[startLine - 1]),
      },
      end: {
        line: endLine,
        character: end - (endLine === 0 ? 0 : lineMap[endLine - 1]),
      },
    },
  };
};
