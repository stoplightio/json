import { isLocalRef } from '../isLocalRef';

describe('isLocalRef', () => {
  it.each(['#', '#/', '#/foo', '#/0/1', '#/~1'])('should treat %s as local reference', ref => {
    expect(isLocalRef(ref)).toEqual(true);
  });

  it.each([
    '',
    '../#',
    'http://a#',
    '/foo/#',
    '../test.yaml#/',
    '#/foo\n/bar',
    '#foo\t/bar',
    '#foo\u2006​/bar',
    ' #foo/bar',
    '#foo /bar',
    '#/foo/bar ',
    '# Hello, world!',
    'foo',
  ])('should not treat %s as local reference', ref => {
    expect(isLocalRef(ref as string)).toEqual(false);
  });
});
