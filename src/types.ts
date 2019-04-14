import { IParserResult, IRange } from '@stoplight/types';
import { Node, NodeType } from 'jsonc-parser';

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

export type JsonParserResult<T> = IParserResult<T, IJsonASTNode, number[]>;
