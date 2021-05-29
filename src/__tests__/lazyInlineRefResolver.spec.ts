import { lazyInlineRefResolver } from '../lazyInlineRefResolver';

describe('lazyInlineResolver', () => {
  test('should work', () => {
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

    expect((lazyInlineRefResolver(doc) as any).b.foo).toBe('woo!');
  });
});
