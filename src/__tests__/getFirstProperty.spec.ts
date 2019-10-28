import { getFirstPrimitiveProperty } from '../getFirstPrimitiveProperty';

describe('getFirstPrimitiveProperty', () => {
  it.each(['true', 'null', '[]', '{}'])('returns nothing when no valid property is found %s', text => {
    expect(getFirstPrimitiveProperty(text)).toBeUndefined();
  });

  it('gets first primitive property', () => {
    expect(getFirstPrimitiveProperty(`{"swagger":"2.0","test":true}`)).toEqual(['swagger', '2.0']);
    expect(getFirstPrimitiveProperty(`{"swagger":2,"baz": {}}`)).toEqual(['swagger', 2]);
    expect(getFirstPrimitiveProperty(`{"swagger":true}`)).toEqual(['swagger', true]);
    expect(getFirstPrimitiveProperty(`{"swagger":false}`)).toEqual(['swagger', false]);
    expect(getFirstPrimitiveProperty(`{"swagger":null}`)).toEqual(['swagger', null]);
    expect(getFirstPrimitiveProperty(`{"openapi":"3.0"}`)).toEqual(['openapi', '3.0']);
    expect(getFirstPrimitiveProperty(`{"openapi":3.1}`)).toEqual(['openapi', 3.1]);
  });
});
