import { Dictionary } from './basic';
import { INode, INodeExample, INodeExternalExample } from './graph';
import { ISchema } from './schemas';
import { IServer } from './servers';
export interface IHttpService extends INode {
    name: string;
}
export interface IHttpOperation extends INode {
    method: string;
    path: string;
    request: IHttpOperationRequest;
    responses: IHttpOperationResponse[];
    servers: IServer[];
    security: HttpSecurityScheme[];
    deprecated?: boolean;
}
export interface IHttpOperationRequest {
    path: IHttpPathParam[];
    query: IHttpQueryParam[];
    headers: IHttpHeaderParam[];
    cookie: IHttpCookieParam[];
    body?: IHttpOperationRequestBody;
}
export interface IHttpOperationRequestBody {
    contents: IHttpContent[];
    required?: boolean;
    description?: string;
}
export interface IHttpOperationResponse {
    code: string;
    contents: IHttpContent[];
    headers: IHttpHeaderParam[];
    description?: string;
}
export interface IHttpParam {
    name: string;
    style: HttpParamStyles;
    description?: string;
    required?: boolean;
    explode?: boolean;
    deprecated?: boolean;
    contents: IHttpContent[];
}
export declare enum HttpParamStyles {
    Simple = "simple",
    Matrix = "matrix",
    Label = "label",
    Form = "form",
    SpaceDelimited = "spaceDelimited",
    PipeDelimited = "pipeDelimited",
    DeepObject = "deepObject"
}
export interface IHttpPathParam extends IHttpParam {
    style: HttpParamStyles.Label | HttpParamStyles.Matrix | HttpParamStyles.Simple;
}
export interface IHttpQueryParam extends IHttpParam {
    style: HttpParamStyles.Form | HttpParamStyles.SpaceDelimited | HttpParamStyles.PipeDelimited | HttpParamStyles.DeepObject;
    allowEmptyValue?: boolean;
    allowReserved?: boolean;
}
export interface IHttpHeaderParam extends IHttpParam {
    style: HttpParamStyles.Simple;
}
export interface IHttpCookieParam extends IHttpParam {
    style: HttpParamStyles.Form;
}
export interface IHttpContent {
    mediaType: string;
    schema?: ISchema;
    examples: Array<INodeExample | INodeExternalExample>;
    encodings: IHttpEncoding[];
}
export interface IHttpEncoding {
    property: string;
    headers: IHttpHeaderParam[];
    mediaType?: string;
    style: HttpParamStyles.Form | HttpParamStyles.SpaceDelimited | HttpParamStyles.PipeDelimited | HttpParamStyles.DeepObject;
    explode?: boolean;
    allowReserved?: boolean;
}
export declare type HttpSecurityScheme = IApiKeySecurityScheme | IBearerSecurityScheme | IBasicSecurityScheme | IOauth2SecurityScheme | IOpenIdConnectSecurityScheme;
interface ISecurityScheme {
    description?: string;
}
export interface IApiKeySecurityScheme extends ISecurityScheme {
    type: 'apiKey';
    name: string;
    in: 'query' | 'header' | 'cookie';
}
export interface IBearerSecurityScheme extends ISecurityScheme {
    type: 'http';
    scheme: 'bearer';
    bearerFormat?: string;
}
export interface IBasicSecurityScheme extends ISecurityScheme {
    type: 'http';
    scheme: 'basic';
}
export interface IOpenIdConnectSecurityScheme extends ISecurityScheme {
    type: 'openIdConnect';
    openIdConnectUrl: string;
}
export interface IOauth2SecurityScheme extends ISecurityScheme {
    type: 'oauth2';
    flows: IOauthFlowObjects;
}
export interface IOauthFlowObjects {
    implicit?: IOauth2ImplicitFlow;
    password?: IOauth2PasswordFlow;
    clientCredentials?: IOauth2ClientCredentialsFlow;
    authorizationCode?: IOauth2AuthorizationCodeFlow;
}
export interface IOauth2Flow {
    scopes: Array<Dictionary<string, string>>;
    refreshUrl?: string;
}
export interface IOauth2ImplicitFlow extends IOauth2Flow {
    authorizationUrl: string;
}
export interface IOauth2AuthorizationCodeFlow extends IOauth2Flow {
    authorizationUrl: string;
    tokenUrl: string;
}
export interface IOauth2PasswordFlow extends IOauth2Flow {
    tokenUrl: string;
}
export interface IOauth2ClientCredentialsFlow extends IOauth2Flow {
    tokenUrl: string;
}
export {};
