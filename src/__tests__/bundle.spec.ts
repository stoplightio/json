import { cloneDeep, get } from 'lodash';

import { BUNDLE_ROOT, bundleTarget } from '../bundle';
import { pointerToPath } from '../pointerToPath';
import { safeStringify } from '../safeStringify';

describe('bundleTargetPath()', () => {
  it('should work', () => {
    const document = {
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

    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/__target__',
    });

    // Do not mutate document
    expect(clone).toEqual(document);

    expect(result).toEqual({
      entity: {
        $ref: `#/${BUNDLE_ROOT}/definitions/user`,
      },
      [BUNDLE_ROOT]: {
        definitions: {
          user: {
            id: 'foo',
            address: {
              $ref: `#/${BUNDLE_ROOT}/definitions/address`,
            },
          },
          address: {
            street: 'foo',
            user: {
              $ref: `#/${BUNDLE_ROOT}/definitions/user`,
            },
          },
        },
      },
    });
  });

  it('should include falsy values', () => {
    const document = {
      definitions: {
        user: {
          id: {
            $ref: '#/definitions/id',
          },
          address: {
            $ref: '#/definitions/address',
          },
        },
        address: {
          street: {
            $ref: '#/definitions/street',
          },
          user: {
            $ref: '#/definitions/user',
          },
        },
        card: {
          zip: '20815',
        },
        street: null,
        id: 0,
      },
      __target__: {
        entity: {
          $ref: '#/definitions/user',
        },
      },
    };

    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/__target__',
    });

    // Do not mutate document
    expect(clone).toEqual(document);

    expect(result).toEqual({
      entity: {
        $ref: `#/${BUNDLE_ROOT}/definitions/user`,
      },
      [BUNDLE_ROOT]: {
        definitions: {
          user: {
            id: {
              $ref: `#/${BUNDLE_ROOT}/definitions/id`,
            },
            address: {
              $ref: `#/${BUNDLE_ROOT}/definitions/address`,
            },
          },
          address: {
            street: {
              $ref: `#/${BUNDLE_ROOT}/definitions/street`,
            },
            user: {
              $ref: `#/${BUNDLE_ROOT}/definitions/user`,
            },
          },
          id: 0,
          street: null,
        },
      },
    });
  });

  it('should not throw erorr', () => {
    const document = {
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
      __target__: {
        entity: {
          $ref: '#/definitions/user',
        },
        entity2: {
          $ref: './path/to/pet.json',
        },
      },
    };

    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/__target__',
    });

    // Do not mutate document
    expect(clone).toEqual(document);

    expect(result).toEqual({
      entity: {
        $ref: `#/${BUNDLE_ROOT}/definitions/user`,
      },
      entity2: {
        $ref: './path/to/pet.json',
      },
      [BUNDLE_ROOT]: {
        definitions: {
          user: {
            id: 'foo',
            address: {
              $ref: `#/${BUNDLE_ROOT}/definitions/address`,
            },
          },
          address: {
            street: 'foo',
            user: {
              $ref: `#/${BUNDLE_ROOT}/definitions/user`,
            },
          },
        },
      },
    });
  });

  it('should throw if invalid pointer for bundle target', () => {
    const document = {
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

    const clone = cloneDeep(document);

    expect(() =>
      bundleTarget({
        document: clone,
        path: 'invalid_pointer',
      }),
    ).toThrow('Invalid JSON Pointer syntax; URI fragment identifiers must begin with a hash.');
  });

  it('should handle invalid pointers for internal $refs', () => {
    const document = {
      definitions: {
        user: {
          id: 'foo',
          address: {
            $ref: '#/definitions/address',
          },
        },
        address: {
          street: 'foo',
          invalidPointer: {
            $ref: '#./definitions/card',
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

    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/__target__',
    });

    // Do not mutate document
    expect(clone).toEqual(document);

    expect(result).toEqual({
      entity: {
        $ref: '#/__bundled__/definitions/user',
      },
      __bundled__: {
        definitions: {
          user: {
            id: 'foo',
            address: {
              $ref: '#/__bundled__/definitions/address',
            },
          },
          address: {
            street: 'foo',
            invalidPointer: {
              $ref: '#./definitions/card',
            },
          },
        },
      },
      __errors__: {
        '#./definitions/card': 'Invalid JSON Pointer syntax.',
      },
    });
  });

  it('should ignore invalid pointers', () => {
    const document = {
      practice: {
        title: 'Account',
        allOf: [
          {
            $ref: '#./UuidModel',
          },
          {
            type: 'object',
            properties: {
              address: {
                $ref: '#./Address',
              },
              email: {
                type: 'string',
                format: 'email',
              },
              name: {
                type: 'string',
              },
              phone: {
                type: 'string',
              },
              website: {
                type: 'string',
                format: 'uri',
              },
              owner: {
                $ref: '#./Account',
              },
            },
            required: ['name'],
          },
        ],
      },
      __target__: {
        $ref: '#/practice',
      },
    };

    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/practice',
    });

    // Do not mutate document
    expect(clone).toEqual(document);

    expect(result).toEqual({
      title: 'Account',
      allOf: [
        {
          $ref: '#./UuidModel',
        },
        {
          type: 'object',
          properties: {
            address: {
              $ref: '#./Address',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            phone: {
              type: 'string',
            },
            website: {
              type: 'string',
              format: 'uri',
            },
            owner: {
              $ref: '#./Account',
            },
          },
          required: ['name'],
        },
      ],
      __errors__: {
        '#./UuidModel': 'Invalid JSON Pointer syntax.',
        '#./Address': 'Invalid JSON Pointer syntax.',
        '#./Account': 'Invalid JSON Pointer syntax.',
      },
    });
  });

  it('should mirror original source decision re arrays or objects', () => {
    const document = {
      parameters: [
        {},
        {
          schema: {
            name: 'param',
          },
        },
      ],
      responses: {
        '200': {
          other: 'foo',
          schema: {
            title: 'OK',
            parameter: {
              $ref: '#/parameters/1/schema',
            },
          },
        },
      },
      __target__: {
        entity: {
          $ref: '#/responses/200/schema',
        },
      },
    };

    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/__target__',
    });

    // Do not mutate document
    expect(clone).toEqual(document);

    expect(result).toEqual({
      entity: {
        $ref: `#/${BUNDLE_ROOT}/responses/200/schema`,
      },
      [BUNDLE_ROOT]: {
        parameters: [
          undefined,
          {
            schema: {
              name: 'param',
            },
          },
        ],
        responses: {
          '200': {
            schema: {
              title: 'OK',
              parameter: {
                $ref: `#/${BUNDLE_ROOT}/parameters/1/schema`,
              },
            },
          },
        },
      },
    });
  });

  it('should support $ref to original document that collides with path on self', () => {
    const document = {
      schemas: {
        user: {
          friend: {
            $ref: '#/schemas/user',
          },
        },
      },
      responses: {
        '200': {
          other: 'foo',
          schema: {
            $ref: '#/schemas/user',
          },
        },
      },
      __target__: {
        user: {
          $ref: '#/schemas/user',
        },
        responses: {
          '200': {
            // as you can see, responses/200 is a path that also exists on __target__
            $ref: '#/responses/200',
          },
        },
      },
    };

    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/__target__',
    });

    // Do not mutate document
    expect(clone).toEqual(document);

    expect(result).toEqual({
      user: {
        $ref: `#/${BUNDLE_ROOT}/schemas/user`,
      },
      responses: {
        '200': {
          $ref: `#/${BUNDLE_ROOT}/responses/200`,
        },
      },
      [BUNDLE_ROOT]: {
        schemas: {
          user: {
            friend: {
              // check recursive
              $ref: `#/${BUNDLE_ROOT}/schemas/user`,
            },
          },
        },
        responses: {
          '200': {
            other: 'foo',
            schema: {
              $ref: `#/${BUNDLE_ROOT}/schemas/user`,
            },
          },
        },
      },
    });
  });

  it('should handle circular $ref', () => {
    const document = {
      openapi: '3.0.0',
      components: {
        schemas: {
          Hello: {
            title: 'Hello',
            type: 'object',
            properties: {
              Hello: {
                $ref: '#/components/schemas/Hello',
              },
              World: {
                $ref: '#/components/schemas/World',
              },
            },
          },
          World: {
            title: 'World',
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        },
      },
    };

    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/components/schemas/Hello',
    });

    // Do not mutate document
    expect(clone).toEqual(document);

    expect(safeStringify(result)).toEqual(
      safeStringify({
        [BUNDLE_ROOT]: {
          components: {
            schemas: {
              Hello: '[Circular]',
              World: {
                properties: {
                  name: {
                    type: 'string',
                  },
                },
                title: 'World',
                type: 'object',
              },
            },
          },
        },
        properties: {
          Hello: {
            $ref: `#/${BUNDLE_ROOT}/components/schemas/Hello`,
          },
          World: {
            $ref: `#/${BUNDLE_ROOT}/components/schemas/World`,
          },
        },
        title: 'Hello',
        type: 'object',
      }),
    );
  });

  it('should handle deep circular refs', () => {
    const document = {
      components: {
        schemas: {
          GeographicalCoordinate: {
            type: 'object',
          },
          Location: {
            type: 'object',
            properties: {
              PhysicalGeographicalCoordinate: {
                $ref: '#/components/schemas/GeographicalCoordinate',
              },
              RelatedLocation: {
                $ref: '#/components/schemas/Location',
              },
            },
          },
        },
      },
    };

    const clone = cloneDeep(document);

    const result = bundleTarget({
      document: clone,
      path: '#/components/schemas/Location',
    });

    // Do not mutate document
    expect(clone).toEqual(document);

    expect(result).toMatchSnapshot();
  });

  it('should not create sparse arrays', () => {
    const document = {
      components: {
        schemas: {
          foo: {
            allOf: [
              {},
              {
                type: 'object',
                properties: {
                  attributes: {
                    allOf: [{}, {}],
                  },
                },
              },
            ],
          },
          foo_again: {
            allOf: [
              {
                $ref: '#/components/schemas/foo/allOf/0',
              },
              {
                type: 'object',
                properties: {
                  attributes: {
                    allOf: [
                      {},
                      {
                        $ref: '#/components/schemas/foo/allOf/1/properties/attributes/allOf/1',
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    };

    const result = bundleTarget({
      document,
      path: '#/components/schemas/foo_again',
    });

    expect(
      '0' in get(result, pointerToPath('#/__bundled__/components/schemas/foo/allOf/1/properties/attributes/allOf')),
    ).toBe(true);
  });
});
