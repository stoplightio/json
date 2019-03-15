import { IDiagnostic } from './validations';
export declare type SourceMapParser<T = any> = (value: string) => IParserResult<T>;
export declare type DocumentUri = string;
export declare type Segment = string | number;
export declare type JSONPath = Segment[];
export interface IParserResult<T = any> {
    data: T;
    diagnostics: IDiagnostic[];
    getJsonPathForPosition(position: IPosition): JSONPath | undefined;
    getLocationForJsonPath(path: JSONPath): ILocation | undefined;
}
export interface IPosition {
    readonly line: number;
    readonly character: number;
}
export interface IRange {
    readonly start: IPosition;
    readonly end: IPosition;
}
export interface ILocation {
    uri: DocumentUri;
    range: IRange;
}
export interface IJsonLocation extends ILocation {
    path: JSONPath;
}
