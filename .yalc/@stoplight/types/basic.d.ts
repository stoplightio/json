export declare type Primitive = string | number | boolean | undefined | null;
export declare type Dictionary<T, K extends string | number = string> = {
    [key in K]: T;
};
export declare type DictionaryValues<T> = T extends Dictionary<infer U> ? U : never;
export declare type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends ReadonlyArray<infer U2> ? ReadonlyArray<DeepPartial<U2>> : DeepPartial<T[P]>;
};
export declare type DeepReadonly<T> = T extends Primitive ? T : T extends Array<infer U> ? ReadonlyArray<U> : T extends Function ? T : DeepReadonlyObject<T>;
declare type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export declare type Opaque<K, T> = T & {
    __TYPE__: K;
};
export {};
