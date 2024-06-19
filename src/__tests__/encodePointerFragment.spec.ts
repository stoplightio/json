import { expect, test } from 'vitest';

import { encodePointerFragment } from '../encodePointerFragment';

test('encodePointerFragment', () => {
  expect(encodePointerFragment('foo')).toEqual('foo');
  expect(encodePointerFragment('0')).toEqual('0');
  expect(encodePointerFragment('paths//users')).toEqual('paths~1~1users');
  expect(encodePointerFragment('foo~users')).toEqual('foo~0users');
  expect(encodePointerFragment('paths//users/foo~users')).toEqual('paths~1~1users~1foo~0users');
});
