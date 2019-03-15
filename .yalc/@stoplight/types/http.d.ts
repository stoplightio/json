import { Dictionary } from './basic';
import { IHttpOperation } from './http-spec';
export declare type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';
export declare type ExtendedHttpMethod = HttpMethod | 'copy' | 'link' | 'unlink' | 'purge' | 'lock' | 'unlock';
export interface IHttpLog<T = any> {
    request: IHttpRequest<T>;
    response?: IHttpResponse<T>;
    operation?: IHttpOperation;
}
export interface IHttpRequest<T = any> {
    method: HttpMethod;
    url: string;
    baseUrl: string;
    headers: HttpNameValue;
    query: HttpNameValues;
    body?: T;
}
export interface IHttpResponse<T = any> {
    status: number;
    headers: HttpNameValue;
    body?: T;
}
export declare type HttpNameValue = Dictionary<string, string>;
export declare type HttpNameValues = Dictionary<string[], string>;
