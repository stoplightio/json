export interface INode {
    id: string;
    iid?: string;
    tags?: INodeTag[];
    summary?: string;
    description?: string;
}
export interface INodeTag {
    name: string;
    description?: string;
}
export interface INodeVariable {
    default: string;
    description?: string;
    enum?: string[];
}
interface INodeExampleBase {
    key: string;
    summary?: string;
    description?: string;
}
export interface INodeExample extends INodeExampleBase {
    value: any;
}
export interface INodeExternalExample extends INodeExampleBase {
    externalValue: string;
}
export {};
