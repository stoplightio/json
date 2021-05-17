import { isLocalRef } from '../isLocalRef';

describe('isLocalRef', () => {
  it.each([
    '#',
    '#/foo',
    '#/foo/0',
    '#/',
    '#/a~1b',
    '#/c%25d',
    '#/e%5Ef',
    '#/g%7Ch',
    '#/i%5Cj',
    '#/k%22l',
    '#/%20',
    '#/m~0n',
  ])('should treat %s as local reference', ref => {
    expect(isLocalRef(ref)).toEqual(true);
  });

  it.each([
    '',
    '../#',
    'http://a#',
    '/foo/#',
    '../test.yaml#/',
    '#/foo\n/bar',
    '#/foo\t/bar',
    '#/foo\u2006​/bar',
    ' #/foo/bar',
    '#/foo /bar',
    '#/foo/bar ',
    '# Hello, world!',
    'foo',
  ])('should not treat %s as local reference', ref => {
    expect(isLocalRef(ref as string)).toEqual(false);
  });
});
