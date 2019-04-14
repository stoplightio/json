import { JsonPath, Omit } from '@stoplight/types';
import { findNodeAtLocation, parse } from 'jsonc-parser';
import _get = require('lodash/get');
import _pullAt = require('lodash/pullAt');
import _unset = require('lodash/unset');
import { IJsonASTNode, JsonParserResult } from './types';

type MutableNode = Omit<IJsonASTNode, 'length' | 'offset'> & { length: number; offset: number };

// function add() {
//
// }

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

    node.parent!.children!.splice(node.parent!.children!.indexOf(node), 1);
    const startOffset = node.range ? node.range!.start.character : 0;
    calculateOffsets(node, node.offset, -node.length - startOffset);
    const linesRemoved = node.range!.end.line - node.range!.start.line;

    if (linesRemoved > 0) {
      result.lineMap.splice(node.range!.start.line, linesRemoved);

      for (let i = node.range!.start.line; i < result.lineMap.length; i++) {
        result.lineMap[i] -= node.length + startOffset;
      }
    }

    if (typeof path[path.length - 1] === 'number') {
      _pullAt(_get(result.data, path.slice(0, -1)), path[path.length - 1] as number);
    } else {
      _unset(result.data, path);
    }

    // todo: wipe any diagnostics between the lines?
  }
}

const calculateOffsets = (node: IJsonASTNode, offset: number, diff: number) => {
  if (diff !== 0) {
    while (node.parent) {
      if (node.offset + node.length > offset) {
        updateChildren(node, node.parent, offset, diff);
      }

      ((node = node.parent) as MutableNode).length += diff;
    }
  }
};

const updateChildren = (src: IJsonASTNode, node: IJsonASTNode, offset: number, diff: number) => {
  if (node.offset + node.length > offset) {
    if (node.offset > offset) {
      (node as MutableNode).offset += diff;
      if (node.range !== undefined) {
        // node.range.start.character =
      }
    }

    if (node.children !== undefined) {
      for (const child of node.children) {
        if (child !== src) {
          updateChildren(src, child, offset, diff);
        }
      }
    }
  }
};

export const enum PatchTypes {
  Remove = 'remove',
  Add = 'add',
}

export interface IJsonRemovePatch {
  type: PatchTypes.Remove;
  path: JsonPath;
}

export type JsonPatch = IJsonRemovePatch;

export const applyJsonPatch = <T>(result: JsonParserResult<T>, patch: JsonPatch): JsonParserResult<T> => {
  switch (patch.type) {
    case PatchTypes.Remove:
      remove(result, patch.path);
      break;

  }

  return result;
};

export const computePatch = (source: string) => {
  return parse(source);
};

// key assumptions:

// - json ast patch supports all (or at least a vast subset) of the operations that fast-json-patch does
// - json ast patch cannot result in syntax error
// - end code is expected to compute the patch using `computePatch` method
// - json/yaml/markdown take care of updating internal data needed to calculate positions + update diagnostics
// - json/yaml/markdown update parsed content
// - ast and internal data are mutatable
