import { cloneDeep } from 'lodash';

import { BUNDLE_ROOT as BUNDLE_ROOT_POINTER, bundleTarget } from '../bundle';

import * as document from './fixtures/bundle-bug-9567.json';

const BUNDLE_ROOT = BUNDLE_ROOT_POINTER.slice(2);

describe('bundleTarget()', () => {
  it('should handle refs in refs', () => {
    console.log(document);
    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/__target__',
    });
    console.log(result);
    console.log(result[BUNDLE_ROOT]);

    // Do not mutate document
    expect(clone).toEqual(document);

    // The __bundled__ value should be an Object not an Array
    expect(Array.isArray(result[BUNDLE_ROOT])).toBe(false);
  });
});
