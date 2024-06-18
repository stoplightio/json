import { expect, test } from 'vitest';

import { resolveSource } from '../utils';

test.each`
  source                             | ref                   | resolved
  ${'https://stoplight.io'}          | ${'#'}                | ${'https://stoplight.io'}
  ${'https://stoplight.io'}          | ${'baz.yaml#'}        | ${'https://stoplight.io/baz.yaml'}
  ${'https://stoplight.io/foo.yaml'} | ${'baz.yaml#'}        | ${'https://stoplight.io/baz.yaml'}
  ${'https://stoplight.io/a'}        | ${'baz.yaml#'}        | ${'https://stoplight.io/baz.yaml'}
  ${'https://stoplight.io/a/b'}      | ${'../baz.yaml#'}     | ${'https://stoplight.io/baz.yaml'}
  ${'/p/abc'}                        | ${'baz.yaml#'}        | ${'/p/baz.yaml'}
  ${'/p/abc'}                        | ${'./baz.yaml#'}      | ${'/p/baz.yaml'}
  ${'/p/abc'}                        | ${'../baz.yaml#'}     | ${'/baz.yaml'}
  ${'/p/abc'}                        | ${'../bar/baz.yaml#'} | ${'/bar/baz.yaml'}
`('given $source source and ref $ref, should return $resolved', ({ source, ref, resolved }) => {
  expect(resolveSource(source, ref)).toBe(resolved);
});
