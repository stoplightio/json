import { resolveInlineRef } from './resolveInlineRef';

const ROOT_MAP = new WeakMap();

type Root = Record<PropertyKey, unknown>;

// todo: handle circular? might be not needed, as simply pass the responsibility onto consumer
const traps: ProxyHandler<Root> = {
  get(target, key, recv) {
    const value = Reflect.get(target, key, recv);

    if (typeof value === 'object' && value !== null) {
      const root = ROOT_MAP.get(target);

      if (!('$ref' in value)) {
        return _lazyInlineRefResolver(value, root);
      }

      const resolved = resolveInlineRef(root, value.$ref);
      if (typeof resolved === 'object' && resolved !== null) {
        return _lazyInlineRefResolver(resolved, root);
      }

      return resolved;
    }

    return value;
  },
};

function _lazyInlineRefResolver(obj: object, root: Root) {
  ROOT_MAP.set(obj, root);
  return new Proxy(obj, traps);
}

export function lazyInlineRefResolver(root: Root) {
  return _lazyInlineRefResolver(root, root);
}
