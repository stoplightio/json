import { cloneDeep as _cloneDeep } from 'lodash';

import { set } from '../set';

describe('set', () => {
  it('should work', () => {
    const val = {
      foo: {
        hi: 'bar',
      },
    };

    expect(set(_cloneDeep(val), 'foo.hi', true)).toEqual({
      foo: { hi: true },
    });
  });
});
