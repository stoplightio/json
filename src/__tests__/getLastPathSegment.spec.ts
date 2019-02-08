import { getLastPathSegment } from '../getLastPathSegment';

describe('getLastPathSegment', () => {
  it('should handle strings without slashes', () => {
    expect(getLastPathSegment('info')).toEqual('info');
    expect(getLastPathSegment('')).toEqual('');
  });

  it('should retrieve last segment', () => {
    expect(getLastPathSegment('/info/title')).toEqual('title');
    expect(getLastPathSegment('/paths/~1pets/post')).toEqual('post');
    expect(getLastPathSegment('/paths/~1~1~1~1pets/post')).toEqual('post');
    expect(getLastPathSegment('/paths/foo~0users')).toEqual('foo~users');
    expect(getLastPathSegment('#/definitions/Error')).toEqual('Error');
  });
});
