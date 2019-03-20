import { Node, NodeType } from 'jsonc-parser';

export interface IJsonASTNode extends Node {
  type: NodeType;
  value?: any;
  offset: number;
  length: number;
  startLine?: number;
  startColumn?: number;
  endLine?: number;
  endColumn?: number;
  colonOffset?: number;
  parent?: IJsonASTNode;
  children?: IJsonASTNode[];
}
