import { expect, test } from 'vitest';

import { encodePointer } from '../encodePointer';

test('encodePointer', () => {
  expect(encodePointer('foo')).toEqual('foo');
  expect(encodePointer('0')).toEqual('0');
  expect(encodePointer('paths//users')).toEqual('paths/~1users');
  expect(encodePointer('foo~users')).toEqual('foo~0users');
  expect(encodePointer('paths//users/foo~users')).toEqual('paths/~1users/foo~0users');
});
