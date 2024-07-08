import { describe, expect, it } from 'vitest';

import { startsWith } from '../startsWith';

describe('startsWith', () => {
  it('should work', () => {
    expect(startsWith([1, 2], [1])).toBeTruthy();
    expect(startsWith([1, 2], [2])).toBeFalsy();

    expect(startsWith('one-two', 'one')).toBeTruthy();
    expect(startsWith('one-two', 'onetwo')).toBeFalsy();
  });
});
