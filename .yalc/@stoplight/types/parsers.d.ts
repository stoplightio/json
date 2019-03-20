import { IDiagnostic } from './diagnostics';
export declare type SourceMapParser<T = unknown, A extends object = object, L = unknown> = (value: string) => IParserResult<T, A, L>;
export declare type DocumentUri = string;
export declare type Segment = string | number;
export declare type JsonPath = Segment[];
export interface IParserResult<T = any, A extends object = object, L = unknown> extends IParserASTResult<T, A, L> {
    diagnostics: IDiagnostic[];
}
export interface IParserASTResult<T = unknown, A extends object = object, L = unknown> {
    data: T;
    ast: A;
    lineMap: L;
}
export declare type GetJsonPathForPosition<A extends object, L = unknown> = (result: IParserASTResult<unknown, A, L>, position: IPosition) => JsonPath | undefined;
export declare type GetLocationForJsonPath<A extends object, L = unknown> = (result: IParserASTResult<unknown, A, L>, path: JsonPath) => ILocation | undefined;
export interface IPosition {
    readonly line: number;
    readonly character: number;
}
export interface IRange {
    readonly start: IPosition;
    readonly end: IPosition;
}
export interface ILocation {
    uri?: DocumentUri;
    range: IRange;
}
export interface IJsonLocation extends ILocation {
    path: JsonPath;
}
