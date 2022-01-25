import { cloneDeep } from 'lodash';

import { BUNDLE_ROOT as BUNDLE_ROOT_POINTER, bundleTarget } from '../bundle';

import * as document from './fixtures/bundle-bug-9567.json';

const BUNDLE_ROOT = BUNDLE_ROOT_POINTER.slice(2);

describe('bundleTarget()', () => {
  it('should handle refs in refs', () => {
    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/__target__',
    });

    // Do not mutate document
    expect(clone).toEqual(document);

    // The __bundled__ value should be an Object not an Array
    expect(Array.isArray(result[BUNDLE_ROOT])).toBe(false);

    expect(result[BUNDLE_ROOT]).toHaveProperty(
      '0',
      expect.objectContaining({
        properties: {
          user_id: {
            format: 'uuid',
            type: 'string',
          },
        },
        required: ['user_id'],
        title: 'user_reference',
        type: 'object',
      }),
    );
  });
});
