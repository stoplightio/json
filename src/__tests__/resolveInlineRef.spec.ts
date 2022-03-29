import { resolveInlineRef, resolveInlineRefWithLocation } from '../resolveInlineRef';

describe('resolveInlineRef', () => {
  test('should follow refs', () => {
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

  test('should follow refs #2', () => {
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

  test('should handle direct circular refs', () => {
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

  test('should handle direct circular refs #2', () => {
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

  test('given external reference, should throw', () => {
    const doc = {
      a: {
        $ref: './foo#/b/foo',
      },
    };

    expect(resolveInlineRef.bind(null, doc, '#/a')).toThrowError('Cannot resolve external references');
  });

  test('given missing segment, should throw', () => {
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

  test('given path pointing at invalid data, should throw', () => {
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

  test('given invalid $ref type, should throw', () => {
    const doc = {
      a: {
        $ref: 2,
      },
    };

    expect(resolveInlineRef.bind(null, doc, '#/a')).toThrowError('$ref should be a string');
  });

  describe('OAS compatibility', () => {
    test('should override summary and description fields', () => {
      const doc = {
        type: 'object',
        properties: {
          caves: {
            type: 'array',
            contains: {
              summary: 'Bear cave',
              $ref: '#/$defs/Cave',
              description: 'Apparently Tom likes bears',
            },
          },
          greatestBear: {
            $ref: '#/$defs/Bear',
            description: 'The greatest bear!',
          },
          bestBear: {
            $ref: '#/$defs/Bear',
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
});
