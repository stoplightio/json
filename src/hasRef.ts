import { isObject } from 'lodash';

export const hasRef = (obj: unknown): obj is object & { $ref: string } =>
  isObject(obj) && '$ref' in obj && typeof (obj as Partial<{ $ref: unknown }>).$ref === 'string';
