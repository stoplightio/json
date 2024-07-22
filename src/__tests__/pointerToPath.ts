import { pointerToPath } from '../pointerToPath';

test('pointerToPath', () => {
  expect(pointerToPath('#/foo')).toEqual(['foo']);
  expect(pointerToPath('#/foo/bar')).toEqual(['foo', 'bar']);
  expect(pointerToPath('#/0')).toEqual(['0']);
  expect(pointerToPath('#/paths/~1users')).toEqual(['paths', '/users']);
  expect(pointerToPath('#/paths/foo~0users')).toEqual(['paths', 'foo~users']);
  expect(pointerToPath('#')).toEqual([]);
  expect(pointerToPath('#/')).toEqual(['']);
  expect(pointerToPath('#/foo%20%5E%20bar')).toEqual(['foo ^ bar']);
  expect(pointerToPath('#/users% ')).toEqual(['users% ']);
});
