import { get } from '../get';

describe('get', () => {
  it('should work', () => {
    const val = {
      foo: {
        hi: 'bar',
      },
    };

    // @ts-ignore
    expect(get()).toBeUndefined();

    expect(get(val, 'foo')).toEqual(val.foo);
    expect(get(val, 'missing')).toBeUndefined();

    // default values
    expect(get(val, 'missing', 2)).toEqual(2);
    expect(get(val, 'missing', [])).toEqual([]);
    expect(get(val, 'missing', {})).toEqual({});

    // array
    expect(get({ definitions: { user: { foo: 'bar' } } }, ['definitions', 'user'])).toEqual({
      foo: 'bar',
    });
  });
});
