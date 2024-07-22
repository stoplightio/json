import { trimStart } from '../trimStart';

describe('trimStart', () => {
  it('should work', () => {
    expect(trimStart([1, 2], [1])).toEqual([2]);
    expect(trimStart([1, 2, 3], [2, 3])).toEqual([1, 2, 3]);
    expect(trimStart([1, 2, 3], [1, 2, 3])).toEqual([]);
    expect(trimStart([1], [1, 2, 3])).toEqual([]);
    expect(trimStart([], [])).toEqual([]);

    expect(trimStart('fooBar', 'foo')).toEqual('Bar');
  });
});
