import { hasRef } from '../hasRef';

describe('hasRef', () => {
  it('should return true for object containing property with $ref key and string value', () => {
    expect(hasRef({ $ref: '' })).toBe(true);
  });

  it('should return false for object not containing property with $ref key and string value', () => {
    expect(hasRef({ $ref: null })).toBe(false);
    expect(hasRef({})).toBe(false);
    expect(hasRef({ x: true })).toBe(false);
    expect(hasRef(null)).toBe(false);
    expect(
      hasRef({
        $ref: {
          $ref: '',
        },
      }),
    ).toBe(false);
  });
});
