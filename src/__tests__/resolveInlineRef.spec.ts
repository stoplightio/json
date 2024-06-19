import { describe, expect, it } from 'vitest';

import { resolveInlineRef, resolveInlineRefWithLocation } from '../resolvers/resolveInlineRef';

describe('resolveInlineRef', () => {
  it('should follow refs', () => {
    const doc = {
      a: {
        $ref: '#/b/foo',
      },
      b: {
        $ref: '#/c',
      },
      c: {
        $ref: '#/d/0',
      },
      d: [
        {
          foo: 'woo!',
        },
      ],
    };

    expect(resolveInlineRef(doc, '#/a')).toEqual('woo!');
    expect(resolveInlineRefWithLocation(doc, '#/a')).toHaveProperty('location', ['d', '0', 'foo']);
  });

  it('should follow refs #2', () => {
    const doc = {
      a: {
        $ref: '#/b/foo',
      },
      b: {
        foo: {
          $ref: '#/c',
        },
        bar: {
          $ref: '#/e',
        },
      },
      c: {
        $ref: '#/b/bar',
      },
      e: 'woo!',
    };

    expect(resolveInlineRef(doc, '#/a')).toEqual('woo!');
    expect(resolveInlineRefWithLocation(doc, '#/a')).toHaveProperty('location', ['e']);
  });

  it('should handle direct circular refs', () => {
    const doc = {
      a: {
        $ref: '#/b',
      },
      b: {
        $ref: '#/a',
      },
    };

    expect(resolveInlineRef(doc, '#/a')).toEqual({
      $ref: '#/a',
    });
    expect(resolveInlineRefWithLocation(doc, '#/a')).toHaveProperty('location', ['b']);
  });

  it('should handle direct circular refs #2', () => {
    const doc = {
      a: {
        $ref: '#/b/foo',
      },
      b: {
        foo: {
          $ref: '#/c',
        },
        bar: {
          $ref: '#/e',
        },
      },
      c: {
        $ref: '#/b/bar',
      },
      e: {
        $ref: '#/a',
      },
    };

    expect(resolveInlineRef(doc, '#/a')).toEqual({
      $ref: '#/a',
    });
    expect(resolveInlineRefWithLocation(doc, '#/a')).toHaveProperty('location', ['e']);
  });

  it('given external reference, should throw', () => {
    const doc = {
      a: {
        $ref: './foo#/b/foo',
      },
    };

    expect(resolveInlineRef.bind(null, doc, '#/a')).toThrowError('Cannot resolve external references');
  });

  it('given missing segment, should throw', () => {
    const doc = {
      a: {
        $ref: '#/b/foo',
      },
      b: {
        bar: false,
      },
    };

    expect(resolveInlineRef.bind(null, doc, '#/a')).toThrowError("Could not resolve '#/b/foo'");
  });

  it('given path pointing at invalid data, should throw', () => {
    const doc = {
      a: {
        $ref: '#/b/foo/bar',
      },
      b: {
        foo: null,
      },
    };

    expect(resolveInlineRef.bind(null, doc, '#/a')).toThrowError("Could not resolve '#/b/foo/bar'");
  });

  it('given invalid $ref type, should throw', () => {
    const doc = {
      a: {
        $ref: 2,
      },
    };

    expect(resolveInlineRef.bind(null, doc, '#/a')).toThrowError('$ref should be a string');
  });

  it('should resolve top-level $ref', () => {
    const doc = {
      $ref: '#/%24defs/User',
      $defs: {
        User: {
          type: 'object',
          properties: {},
        },
      },
    };

    expect(resolveInlineRef(doc, '#')).toEqual({
      type: 'object',
      properties: {},
    });
    expect(resolveInlineRefWithLocation(doc, '#')).toEqual({
      source: null,
      location: ['$defs', 'User'],
      value: {
        type: 'object',
        properties: {},
      },
    });
  });

  describe('OAS compatibility', () => {
    it('should override summary and description fields', () => {
      const doc = {
        type: 'object',
        properties: {
          caves: {
            type: 'array',
            contains: {
              summary: 'Bear cave',
              $ref: '#/%24defs/Cave',
              description: 'Apparently Tom likes bears',
            },
          },
          greatestBear: {
            $ref: '#/%24defs/Bear',
            description: 'The greatest bear!',
          },
          bestBear: {
            $ref: '#/%24defs/Bear',
            summary: 'The best bear!',
          },
        },
        $defs: {
          Bear: {
            type: 'string',
            summary: "Tom's favorite bear",
          },
          Cave: {
            type: 'string',
            summary: 'A cave',
            description: '_Everyone_ ~hates~ loves caves',
          },
        },
      };

      expect(resolveInlineRef(doc, '#/properties/caves/contains')).toStrictEqual({
        type: 'string',
        summary: 'Bear cave',
        description: 'Apparently Tom likes bears',
      });

      expect(resolveInlineRefWithLocation(doc, '#/properties/caves/contains')).toHaveProperty('location', [
        '$defs',
        'Cave',
      ]);

      expect(resolveInlineRef(doc, '#/properties/greatestBear')).toStrictEqual({
        type: 'string',
        description: 'The greatest bear!',
        summary: "Tom's favorite bear",
      });
      expect(resolveInlineRefWithLocation(doc, '#/properties/greatestBear')).toHaveProperty('location', [
        '$defs',
        'Bear',
      ]);

      expect(resolveInlineRef(doc, '#/properties/bestBear')).toStrictEqual({
        type: 'string',
        summary: 'The best bear!',
      });
      expect(resolveInlineRefWithLocation(doc, '#/properties/bestBear')).toHaveProperty('location', ['$defs', 'Bear']);
    });
  });

  it('handles encoded characters', () => {
    const doc = {
      type: 'object',
      $defs: {
        'Cool Bear': {
          type: 'string',
        },
        'самый крутой медведь?': {
          const: 'винни пух)',
        },
      },
    };

    expect(resolveInlineRef(doc, '#/%24defs/Cool%20Bear')).toStrictEqual({
      type: 'string',
    });

    expect(
      resolveInlineRef(
        doc,
        '#/%24defs/%D1%81%D0%B0%D0%BC%D1%8B%D0%B9%20%D0%BA%D1%80%D1%83%D1%82%D0%BE%D0%B9%20%D0%BC%D0%B5%D0%B4%D0%B2%D0%B5%D0%B4%D1%8C%3F',
      ),
    ).toStrictEqual({
      const: 'винни пух)',
    });
  });

  it('gracefully handles unencoded characters', () => {
    const doc = {
      type: 'object',
      $defs: {
        'Cool Bear': {
          type: 'string',
        },
      },
    };

    expect(resolveInlineRef(doc, '#/$defs/Cool Bear')).toStrictEqual({
      type: 'string',
    });
  });
});
