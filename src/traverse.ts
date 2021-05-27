import { JsonPath, Segment } from '@stoplight/types';

type Hooks = {
  onEnter(ctx: Readonly<{ value: object; path: JsonPath }>): void;
  onLeave(ctx: Readonly<{ value: object; path: JsonPath }>): void;
  onProperty(ctx: Readonly<{ parent: object; parentPath: JsonPath; property: Segment; propertyValue: unknown }>): void;
};

const _traverse = (obj: object, hooks: Partial<Hooks>, path: JsonPath) => {
  const ctx = { value: obj, path };

  if (hooks.onEnter) {
    hooks.onEnter(ctx);
  }

  for (const i of Object.keys(obj)) {
    const value = obj[i];

    if (hooks.onProperty) {
      hooks.onProperty({ parent: obj, parentPath: path, property: i, propertyValue: value });
    }

    if (typeof value === 'object' && value !== null) {
      _traverse(value, hooks, path.concat(i));
    }
  }

  if (hooks.onLeave) {
    hooks.onLeave(ctx);
  }
};

export const traverse = (obj: unknown, hooks: Partial<Hooks> | Hooks['onProperty']) => {
  if (typeof obj === 'object' && obj !== null) {
    _traverse(obj, typeof hooks === 'function' ? { onProperty: hooks } : hooks, []);
  }
};
