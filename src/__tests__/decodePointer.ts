import { decodePointer } from '../decodePointer';

test('decodePointer', () => {
  expect(decodePointer('foo')).toEqual('foo');
  expect(decodePointer('foo/bar')).toEqual('foo/bar');
  expect(decodePointer('0')).toEqual('0');
  expect(decodePointer('paths/~1users')).toEqual('paths//users');
  expect(decodePointer('paths/foo~0users')).toEqual('paths/foo~users');
  expect(decodePointer('#/foo')).toEqual('#/foo');
  expect(decodePointer('#/foo%20%5E%20bar')).toEqual('#/foo ^ bar');
  expect(decodePointer('#/users% ')).toEqual('#/users% ');
  expect(decodePointer('#/users%%20%5E%')).toEqual('#/users% ^%');
});
