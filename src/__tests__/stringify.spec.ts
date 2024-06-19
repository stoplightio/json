import { describe, expect, it } from 'vitest';

import { safeStringify } from '../safeStringify';
import { stringify } from '../stringify';

describe('stringify', () => {
  it('should produce the same result as safeStringify', () => {
    expect(stringify({ foo: true })).toEqual(safeStringify({ foo: true }));

    expect(stringify({ foo: true, bar: false }, void 0, 4)).toEqual(
      safeStringify(
        {
          foo: true,
          bar: false,
        },
        void 0,
        4,
      ),
    );
  });

  it.each([void 0, Symbol(), Function])('should throw for unserializable %s value', value => {
    expect(stringify.bind(null, value)).toThrow();
    expect(stringify.bind(null, { toJSON: () => value })).toThrow();
  });
});
