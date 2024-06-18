import { ORDER_KEY_ID } from '@stoplight/ordered-object-literal';

export const KEYS = Symbol.for(ORDER_KEY_ID);

export const trapAccess = <T extends object = object>(target: T): T =>
  new Proxy<T>(target, {
    ownKeys(target: unknown) {
      if (typeof target === 'object' && target !== null && KEYS in target) {
        return target[KEYS] as ArrayLike<string | symbol>;
      }
      return Reflect.ownKeys(target as object);
    },
  });
