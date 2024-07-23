import { decodePointerFragment } from '../decodePointerFragment';

test('decodePointerFragment', () => {
  expect(decodePointerFragment('foo')).toEqual('foo');
  expect(decodePointerFragment('foo/bar')).toEqual('foo/bar');
  expect(decodePointerFragment('0')).toEqual('0');
  expect(decodePointerFragment('paths/~1users')).toEqual('paths//users');
  expect(decodePointerFragment('paths/foo~0users')).toEqual('paths/foo~users');
  expect(decodePointerFragment('paths/foo~1~0users~1~0foo')).toEqual('paths/foo/~users/~foo');
  expect(decodePointerFragment('#/foo')).toEqual('#/foo');
});
