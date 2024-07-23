import { isPlainObject } from '../isPlainObject';

test('isPlainObject', () => {
  expect(isPlainObject(new (class Foo {})())).toBe(false);
  expect(isPlainObject([1, 2, 3])).toBe(false);

  expect(isPlainObject({ x: 0, y: 0 })).toBe(true);
  expect(isPlainObject(Object.create(null))).toBe(true);

  const a = new (class {})();
  a.constructor = Object;
  expect(isPlainObject(a)).toBe(true);
});
