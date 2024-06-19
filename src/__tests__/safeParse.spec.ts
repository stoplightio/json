import { describe, expect, it } from 'vitest';

import { safeParse } from '../safeParse';

describe('safeParse', () => {
  it('should work', () => {
    const val = '{"foo":true}';
    expect(safeParse(val)).toEqual({ foo: true });

    // should return undefined on error
    expect(safeParse('{')).toEqual(undefined);

    // @ts-ignore
    expect(safeParse({ foo: true })).toEqual({ foo: true });
  });
});
