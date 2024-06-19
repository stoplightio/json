import { expect, test } from 'vitest';

import { toPropertyPath } from '../toPropertyPath';

test('toPropertyPath', () => {
  expect(toPropertyPath('info')).toEqual('info');
  expect(toPropertyPath('/info/title')).toEqual('info.title');
  expect(toPropertyPath('/paths/~1pets/post')).toEqual('paths./pets.post');
  expect(toPropertyPath('/paths/~1~1~1~1pets/post')).toEqual('paths.////pets.post');
  expect(toPropertyPath('/paths/foo~0users')).toEqual('paths.foo~users');
  expect(toPropertyPath('#/definitions/Error')).toEqual('definitions.Error');
  expect(toPropertyPath('/a/..dotted/path')).toEqual('a.["..dotted"].path');
  expect(toPropertyPath('/a/..dotted/path')).toEqual('a.["..dotted"].path');
  expect(toPropertyPath('/a/..dotted.and."quoted"/path')).toEqual('a.["..dotted.and.\\"quoted\\""].path');
});
