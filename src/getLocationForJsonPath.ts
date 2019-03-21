import { GetLocationForJsonPath } from '@stoplight/types';
import { findNodeAtLocation } from 'jsonc-parser';
import { IJsonASTNode } from './types';

export const getLocationForJsonPath: GetLocationForJsonPath<IJsonASTNode, number[]> = ({ lineMap, ast }, path) => {
  const node = findNodeAtLocation(ast, path) as IJsonASTNode;

  if (node === undefined) {
    return;
  }

  return { range: node.range! };
};
