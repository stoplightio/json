import { JsonPath, Omit } from '@stoplight/types';
import { findNodeAtLocation, parse } from 'jsonc-parser';
import _get = require('lodash/get');
import _pullAt = require('lodash/pullAt');
import _unset = require('lodash/unset');
import { IJsonASTNode, JsonParserResult } from './types';

type MutableNode = Omit<IJsonASTNode, 'length' | 'offset'> & { length: number; offset: number };

function getNextChild(node: IJsonASTNode) {
  const index = node.parent!.children!.indexOf(node);
  if (index < node.parent!.children!.length - 1) {
    return node.parent!.children![index + 1];
  }

  return null;
}

function add<T>(result: JsonParserResult<T>, path: JsonPath, data: JsonParserResult<T>): void {
  if (path.length === 0) {
    Object.assign(result, data);
    return;
  }

  // const node = findNodeAtLocation(result.ast, path) as IJsonASTNode;
}

function remove<T>(result: JsonParserResult<T>, path: JsonPath): void {
  if (path.length === 0) {
    result.ast.children!.length = 0;
    (result.ast as MutableNode).length = 0;
    result.data = {} as T;
    result.diagnostics = [];
    result.lineMap.length = 0;
    return;
  }

  let node = findNodeAtLocation(result.ast, path) as IJsonASTNode;
  if (node && node.parent) {
    if (node.parent.type !== 'array') {
      node = node.parent;
    }

    const nextChild = getNextChild(node);

    node.parent!.children!.splice(node.parent!.children!.indexOf(node), 1);
    const linesRemoved = node.range!.end.line - node.range!.start.line;

    const extraOffset = nextChild ? nextChild.offset - node.offset - node.length : 0;

    if (linesRemoved > 0) {
      result.lineMap.splice(node.range!.start.line, linesRemoved);

      for (let i = node.range!.start.line; i < result.lineMap.length; i++) {
        result.lineMap[i] -= node.length;
      }
    }

    recomputeOffsets(node, -node.length - extraOffset, node.offset);

    if (typeof path[path.length - 1] === 'number') {
      _pullAt(_get(result.data, path.slice(0, -1)), path[path.length - 1] as number);
    } else {
      _unset(result.data, path);
    }

    // todo: wipe any diagnostics between the lines?
  }
}

const recomputeOffsets = (node: IJsonASTNode, diff: number, offset: number) => {
  if (diff !== 0) {
    while (node.parent) {
      if (node.offset + node.length > offset && node.children !== undefined) {
        for (const child of getRelevantChildren(node.children, offset)) {
          (child as MutableNode).offset += diff;
          if (child.range !== undefined) {
            // node.range = getLocationForJsonPath
          }
        }
      }

      ((node = node.parent) as MutableNode).length += diff;
    }
  }
};

function* getRelevantChildren(nodes: IJsonASTNode[], offset: number): IterableIterator<IJsonASTNode> {
  for (const node of nodes) {
    if (node.offset > offset) {
      yield node;

      if (node.children !== undefined) {
        yield* getRelevantChildren(node.children, offset);
      }
    }
  }
}

export const enum PatchTypes {
  Remove = 'remove',
  Add = 'add',
}

export interface IJsonRemovePatch {
  type: PatchTypes.Remove;
  path: JsonPath;
}

export interface IJsonAddPatch<T> {
  type: PatchTypes.Add;
  path: JsonPath;
  data: JsonParserResult<T>;
}

export type JsonPatch<T> = IJsonRemovePatch | IJsonAddPatch<T>;

export const applyJsonPatch = <T>(result: JsonParserResult<T>, patch: JsonPatch<T>): JsonParserResult<T> => {
  switch (patch.type) {
    case PatchTypes.Remove:
      remove(result, patch.path);
      break;
    case PatchTypes.Add:
      add<T>(result, patch.path, patch.data);
      break;
  }

  return result;
};

export const computePatch = (source: string) => {
  return parse(source);
};
