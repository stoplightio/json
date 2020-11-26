import { resolveInlineRef } from '../resolveInlineRef';

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
        $ref: '#/d',
      },
      d: {
        foo: 'woo!',
      },
    };

    expect(resolveInlineRef(doc, '#/a')).toEqual('woo!');
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
});
