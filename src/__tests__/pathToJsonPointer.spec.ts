import { pathToPointer } from '../pathToPointer';

test('pathToPointer', () => {
  expect(pathToPointer(['foo'])).toEqual('#/foo');
  expect(pathToPointer(['foo', 'bar'])).toEqual('#/foo/bar');
  expect(pathToPointer(['0'])).toEqual('#/0');
  expect(pathToPointer(['paths', '/users'])).toEqual('#/paths/~1users');
  expect(pathToPointer(['paths', 'foo~users'])).toEqual('#/paths/foo~0users');
  expect(pathToPointer([])).toEqual('#');
  expect(pathToPointer([''])).toEqual('#/');
});
