import { hasSomeRef } from './resolvers/guards';

export const hasRef = (obj: unknown): obj is Record<string, unknown> & { $ref: string } =>
  hasSomeRef(obj) && typeof obj.$ref === 'string';
