import { extractPointerFromRef } from '../extractPointerFromRef';

describe('extractPointerFromRef', () => {
  it.each`
    ref                       | expected
    ${1}                      | ${null}
    ${'../foo.json#'}         | ${'#'}
    ${'../foo.json#/'}        | ${'#/'}
    ${'../foo.json#/foo/bar'} | ${'#/foo/bar'}
    ${'../foo.json'}          | ${null}
    ${'foo.json'}             | ${null}
    ${'http://foo.com#/foo'}  | ${'#/foo'}
    ${''}                     | ${null}
    ${'#'}                    | ${'#'}
    ${'#/foo/bar'}            | ${'#/foo/bar'}
  `('should return $expected pointer for $ref', ({ ref, expected }) => {
    expect(extractPointerFromRef(ref)).toEqual(expected);
  });
});
