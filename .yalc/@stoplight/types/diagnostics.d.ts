import { ILocation, IRange, JsonPath } from './parsers';
export declare enum DiagnosticSeverity {
    Error = 0,
    Warning = 1,
    Information = 2,
    Hint = 3
}
export declare type DiagnosticTag = string;
export interface IDiagnostic {
    range: IRange;
    message: string;
    severity: DiagnosticSeverity;
    source?: string;
    path?: JsonPath;
    code?: string | number;
    tags?: DiagnosticTag[];
    relatedInformation?: IDiagnosticRelatedInformation[];
}
export interface IDiagnosticRelatedInformation {
    location: ILocation;
    message: string;
}
