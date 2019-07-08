import { IRange } from '@stoplight/types';
import { Node, NodeType, ParseOptions } from 'jsonc-parser';

export interface IJsonASTNode extends Node {
  type: NodeType;
  value?: any;
  offset: number;
  length: number;
  range?: IRange;
  colonOffset?: number;
  parent?: IJsonASTNode;
  children?: IJsonASTNode[];
}

export interface IParseOptions extends ParseOptions {
  ignoreDuplicateKeys?: boolean;
}
