import { pathToPointer } from '../pathToPointer';

test('pathToPointer', () => {
  expect(pathToPointer(['foo'])).toEqual('#/foo');
  expect(pathToPointer(['foo', 'bar'])).toEqual('#/foo/bar');
  expect(pathToPointer(['0'])).toEqual('#/0');
  expect(pathToPointer(['paths', '/users'])).toEqual('#/paths/~1users');
  expect(pathToPointer(['paths', 'foo~users'])).toEqual('#/paths/foo~0users');
  expect(pathToPointer([])).toEqual('#');
  expect(pathToPointer([''])).toEqual('#/');
  expect(pathToPointer(['paths', '/user/{userId}'])).toEqual('#/paths/~1user~1%7BuserId%7D');
  expect(pathToPointer(['paths', '/user/{userId}/~foo'])).toEqual('#/paths/~1user~1%7BuserId%7D~1~0foo');
  expect(pathToPointer(['$defs', 'User Model'])).toEqual('#/%24defs/User%20Model');
});
