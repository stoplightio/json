import { isLocalRef } from '../isLocalRef';

describe('isLocalRef', () => {
  it.each(['#', '#/', '#/foo', '#/0/1', '#/~1'])('should treat %s as local reference', ref => {
    expect(isLocalRef(ref)).toEqual(true);
  });

  it.each(['', '../#', 'http://a#', '/foo/#', '../test.yaml#/'])('should not treat %s as local reference', ref => {
    expect(isLocalRef(ref)).toEqual(false);
  });
});
