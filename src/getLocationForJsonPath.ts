import { GetLocationForJsonPath, JsonPath } from '@stoplight/types';
import { IJsonASTNode, JsonParserResult } from './types';

export const getLocationForJsonPath: GetLocationForJsonPath<JsonParserResult<unknown>> = (
  { lineMap, ast },
  path,
  closest = false,
) => {
  const node = findNodeAtPath(ast, path, closest) as IJsonASTNode;

  if (node === void 0 || node.range === void 0) {
    return;
  }

  return { range: node.range };
};

// based on source code of https://github.com/microsoft/node-jsonc-parser
function findNodeAtPath(node: IJsonASTNode, path: JsonPath, closest: boolean): IJsonASTNode | undefined {
  pathLoop: for (const part of path) {
    const segment = Number.isInteger(Number(part)) ? Number(part) : part;
    if (typeof segment === 'string' || (typeof segment === 'number' && node.type !== 'array')) {
      if (node.type !== 'object' || !Array.isArray(node.children)) {
        return closest ? node : void 0;
      }

      for (const propertyNode of node.children) {
        if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === String(segment)) {
          node = propertyNode.children[1];
          continue pathLoop;
        }
      }

      return closest ? node : void 0;
    } else {
      if (node.type !== 'array' || segment < 0 || !Array.isArray(node.children) || segment >= node.children.length) {
        return closest ? node : void 0;
      }

      node = node.children[segment];
    }
  }

  return node;
}
