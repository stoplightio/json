export const KEYS = Symbol('object_keys');

const traps = {
  ownKeys(target: object) {
    return KEYS in target ? target[KEYS] : Reflect.ownKeys(target);
  },
};

export const trapAccess = <T extends object = object>(target: T): T => new Proxy<T>(target, traps);
