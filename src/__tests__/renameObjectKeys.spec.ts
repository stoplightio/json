import { renameObjectKey } from '../renameObjectKey';

describe('renameObjectKey', () => {
  it('should handle empty obj', () => {
    expect(renameObjectKey({}, 'old', 'new')).toEqual({});
  });

  it('should not mutate given object', () => {
    const obj = { old: 'test' };
    const newObj = renameObjectKey(obj, 'old', 'new');
    expect(obj).not.toBe(newObj);
  });

  it('should handle simple case', () => {
    const newObj = renameObjectKey(
      {
        foo: 1,
        old: 2,
        boo: 3,
      },
      'old',
      'new'
    );

    expect(newObj).toEqual({
      foo: 1,
      new: 2,
      boo: 3,
    });
    expect(Object.keys(newObj)).toEqual(['foo', 'new', 'boo']);
  });

  it('should handle replace', () => {
    const newObj = renameObjectKey(
      {
        foo: 1,
        old: 2,
        boo: 3,
      },
      'old',
      'boo'
    );

    expect(newObj).toEqual({
      foo: 1,
      boo: 2,
    });
    expect(Object.keys(newObj)).toEqual(['foo', 'boo']);
  });

  it('should handle add', () => {
    const newObj = renameObjectKey(
      {
        foo: 1,
        old: 2,
      },
      'old',
      'boo'
    );

    expect(newObj).toEqual({
      foo: 1,
      boo: 2,
    });
    expect(Object.keys(newObj)).toEqual(['foo', 'boo']);
  });

  it('should handle setting key to itself', () => {
    const newObj = renameObjectKey(
      {
        foo: 1,
        old: 2,
      },
      'old',
      'old'
    );

    expect(newObj).toEqual({
      foo: 1,
      old: 2,
    });
    expect(Object.keys(newObj)).toEqual(['foo', 'old']);
  });
});
