import { KEYS, trapAccess } from '../trapAccess';

describe('trapAccess', () => {
  test('given no KEYS, should use own keys in ownKeys trap', () => {
    const obj = trapAccess({ '404': null, '200': null });
    expect(Reflect.ownKeys(obj)).toEqual(['200', '404']);
  });

  test('given KEYS, should use KEYS in ownKeys trap', () => {
    const obj = trapAccess({ '404': null, '200': null, [KEYS]: ['404', '200'] });
    expect(Reflect.ownKeys(obj)).toEqual(['404', '200']);
  });
});
