import { ORDER_KEY_ID } from '@stoplight/ordered-object-literal';

export const KEYS = Symbol.for(ORDER_KEY_ID);

const traps = {
  ownKeys(target: object) {
    return KEYS in target ? target[KEYS] : Reflect.ownKeys(target);
  },
};

export const trapAccess = <T extends object = object>(target: T): T => new Proxy<T>(target, traps);
