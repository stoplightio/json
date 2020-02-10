import { bundleTarget } from '../bundle';

describe('bundleTargetPath()', () => {
  it('should work', () => {
    const root = {
      definitions: {
        user: {
          id: 'foo',
          address: {
            $ref: '#/definitions/address',
          },
        },
        address: {
          street: 'foo',
          user: {
            $ref: '#/definitions/user',
          },
        },
        card: {
          zip: '20815',
        },
      },
      __target__: {
        entity: {
          $ref: '#/definitions/user',
        },
      },
    };

    const result = bundleTarget({
      root,
    });

    expect(result).toEqual({
      entity: {
        $ref: '#/definitions/user',
      },
      definitions: {
        user: {
          id: 'foo',
          address: {
            $ref: '#/definitions/address',
          },
        },
        address: {
          street: 'foo',
          user: {
            $ref: '#/definitions/user',
          },
        },
      },
    });
  });
});
