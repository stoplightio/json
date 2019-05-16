import { GetLocationForJsonPath, JsonPath } from '@stoplight/types';
import { IJsonASTNode } from './types';

export const getLocationForJsonPath: GetLocationForJsonPath<IJsonASTNode, number[]> = (
  { lineMap, ast },
  path,
  closest = false
) => {
  const node = findNodeAtPath(ast, path, closest) as IJsonASTNode;

  if (node === undefined || node.range === undefined) {
    return;
  }

  return { range: node.range };
};

// based on source code of https://github.com/microsoft/node-jsonc-parser
function findNodeAtPath(node: IJsonASTNode, path: JsonPath, closest: boolean): IJsonASTNode | undefined {
  pathLoop: for (const segment of path) {
    if (typeof segment === 'string') {
      if (node.type !== 'object' || !Array.isArray(node.children)) {
        return closest ? node : undefined;
      }

      for (const propertyNode of node.children) {
        if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment) {
          node = propertyNode.children[1];
          continue pathLoop;
        }
      }

      return closest ? node : undefined;
    } else {
      if (node.type !== 'array' || segment < 0 || !Array.isArray(node.children) || segment >= node.children.length) {
        return closest ? node : undefined;
      }

      node = node.children[segment];
    }
  }

  return node;
}
