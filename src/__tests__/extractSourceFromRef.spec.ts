import { extractSourceFromRef } from '../extractSourceFromRef';

describe('extractSourceFromRef', () => {
  it.each`
    ref                       | expected
    ${1}                      | ${null}
    ${'../foo.json#'}         | ${'../foo.json'}
    ${'../foo.json#/'}        | ${'../foo.json'}
    ${'../foo.json#/foo/bar'} | ${'../foo.json'}
    ${'../foo.json'}          | ${'../foo.json'}
    ${'foo.json'}             | ${'foo.json'}
    ${'http://foo.com#/foo'}  | ${'http://foo.com'}
    ${''}                     | ${null}
    ${'#'}                    | ${null}
    ${'#/foo/bar'}            | ${null}
  `('should return $expected source for $ref', ({ ref, expected }) => {
    expect(extractSourceFromRef(ref)).toEqual(expected);
  });
});
