import { cloneDeep } from 'lodash';

import { BUNDLE_ROOT, bundleTarget } from '../bundle';
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
});
