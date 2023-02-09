/* eslint-disable simple-import-sort/imports */
import { cloneDeep, get as _get } from 'lodash';

import { BUNDLE_ROOT as BUNDLE_ROOT_POINTER, bundleTarget } from '../bundle';
import { safeStringify } from '../safeStringify';

const BUNDLE_ROOT = BUNDLE_ROOT_POINTER.slice(2);

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
        $ref: `#/${BUNDLE_ROOT}/user`,
      },
      [BUNDLE_ROOT]: {
        user: {
          id: 'foo',
          address: {
            $ref: `#/${BUNDLE_ROOT}/address`,
          },
        },
        address: {
          street: 'foo',
          user: {
            $ref: `#/${BUNDLE_ROOT}/user`,
          },
        },
      },
    });
  });

  it('should operate on original object if `cloneDocument` set to false', () => {
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

    const result = bundleTarget({
      document,
      path: '#/__target__',
      cloneDocument: false,
    });

    expect(document.__target__).toStrictEqual(result);

    expect(result).toEqual({
      entity: {
        $ref: `#/${BUNDLE_ROOT}/user`,
      },
      [BUNDLE_ROOT]: {
        user: {
          id: 'foo',
          address: {
            $ref: `#/${BUNDLE_ROOT}/address`,
          },
        },
        address: {
          street: 'foo',
          user: {
            $ref: `#/${BUNDLE_ROOT}/user`,
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
        $ref: `#/${BUNDLE_ROOT}/user`,
      },
      [BUNDLE_ROOT]: {
        user: {
          id: {
            $ref: `#/${BUNDLE_ROOT}/id`,
          },
          address: {
            $ref: `#/${BUNDLE_ROOT}/address`,
          },
        },
        address: {
          street: {
            $ref: `#/${BUNDLE_ROOT}/street`,
          },
          user: {
            $ref: `#/${BUNDLE_ROOT}/user`,
          },
        },
        id: 0,
        street: null,
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
        $ref: `#/${BUNDLE_ROOT}/user`,
      },
      entity2: {
        $ref: './path/to/pet.json',
      },
      [BUNDLE_ROOT]: {
        user: {
          id: 'foo',
          address: {
            $ref: `#/${BUNDLE_ROOT}/address`,
          },
        },
        address: {
          street: 'foo',
          user: {
            $ref: `#/${BUNDLE_ROOT}/user`,
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
        $ref: '#/__bundled__/user',
      },
      __bundled__: {
        user: {
          id: 'foo',
          address: {
            $ref: '#/__bundled__/address',
          },
        },
        address: {
          street: 'foo',
          invalidPointer: {
            $ref: '#./definitions/card',
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
        $ref: `#/${BUNDLE_ROOT}/schema`,
      },
      [BUNDLE_ROOT]: {
        schema: {
          title: 'OK',
          parameter: {
            $ref: `#/${BUNDLE_ROOT}/schema_2`,
          },
        },
        schema_2: {
          name: 'param',
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
        $ref: `#/${BUNDLE_ROOT}/user`,
      },
      responses: {
        '200': {
          $ref: `#/${BUNDLE_ROOT}/200`,
        },
      },
      [BUNDLE_ROOT]: {
        user: {
          friend: {
            // check recursive
            $ref: `#/${BUNDLE_ROOT}/user`,
          },
        },
        '200': {
          other: 'foo',
          schema: {
            $ref: `#/${BUNDLE_ROOT}/user`,
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
        title: 'Hello',
        type: 'object',
        properties: {
          Hello: {
            $ref: `#`,
          },
          World: {
            $ref: `#/${BUNDLE_ROOT}/World`,
          },
        },
        [BUNDLE_ROOT]: {
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

    expect(safeStringify(result)).toEqual(
      safeStringify({
        type: 'object',
        properties: {
          PhysicalGeographicalCoordinate: {
            $ref: '#/__bundled__/GeographicalCoordinate',
          },
          RelatedLocation: {
            $ref: '#',
          },
        },
        __bundled__: {
          GeographicalCoordinate: {
            type: 'object',
          },
        },
      }),
    );
  });

  it('should follow $refs', () => {
    const document = {
      components: {
        schemas: {
          GeographicalCoordinate: {
            $ref: '#/components/schemas/Location',
          },
          Location: {
            type: 'object',
            properties: {
              Latitude: {
                type: 'string',
              },
              RelatedLocation: {
                $ref: '#/components/schemas/GeographicalCoordinate/properties/Latitude',
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

    expect(safeStringify(result, void 0, 2)).toEqual(
      safeStringify(
        {
          type: 'object',
          properties: {
            Latitude: {
              type: 'string',
            },
            RelatedLocation: {
              $ref: '#/__bundled__/Latitude',
            },
          },
          __bundled__: {
            Latitude: {
              type: 'string',
            },
          },
        },
        void 0,
        2,
      ),
    );
  });

  it('should not create sparse arrays', () => {
    const document = {
      components: {
        schemas: {
          bar: {
            type: 'array',
            items: [
              {
                type: 'string',
              },
              {
                type: 'number',
              },
            ],
          },
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
          baz: {
            type: 'object',
            properties: {
              attributes: {
                anyOf: [
                  {
                    $ref: '#/components/schemas/bar/items/1',
                  },
                  {
                    $ref: '#/components/schemas/foo/allOf/1/properties/attributes/allOf/1',
                  },
                ],
              },
            },
          },
        },
      },
    };

    const result = bundleTarget({
      document,
      path: '#/components/schemas/baz',
    });

    expect(result).toStrictEqual({
      type: 'object',
      properties: {
        attributes: {
          anyOf: [
            {
              $ref: '#/__bundled__/items_1',
            },
            {
              $ref: '#/__bundled__/allOf_1',
            },
          ],
        },
      },
      __bundled__: {
        items_1: {
          type: 'number',
        },
        allOf_1: {},
      },
    });
  });

  it('should prefer data type of $reffed data', () => {
    const document = {
      root: {
        foo: {
          allOf: [
            {
              title: 'user_reference',
            },
          ],
        },
        bar: {
          allOf: [
            {
              data: {
                $ref: '#/root/foo',
              },
            },
          ],
        },
      },
      __target__: {
        responses: {
          $ref: '#/root/bar/allOf/0/data/allOf/0',
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

    // The __bundled__ value should be an Object not an Array
    expect(Array.isArray(result[BUNDLE_ROOT])).toBe(false);

    expect(result[BUNDLE_ROOT]).toHaveProperty('0', {
      title: 'user_reference',
    });
  });

  it('should not convert object to array when using numeric keys', () => {
    const result = bundleTarget({
      document: {
        openapi: '3.0.0',
        paths: {
          '/path': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          numModel: { $ref: '#/components/schemas/200' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            '200': {
              title: '200',
              type: 'object',
              properties: { id: { type: 'string' } },
            },
          },
        },
        __target__: {
          id: '?http-operation-id?',
          method: 'get',
          path: '/path',
          responses: [
            {
              code: '200',
              headers: [],
              contents: [
                {
                  mediaType: 'application/json',
                  schema: {
                    type: 'object',
                    properties: {
                      numModel: { $ref: '#/components/schemas/200' },
                    },
                    $schema: 'http://json-schema.org/draft-07/schema#',
                  },
                  examples: [],
                  encodings: [],
                },
              ],
            },
          ],
        },
      },
      path: '#/__target__',
      bundleRoot: '#/components/schemas',
    });

    expect(Array.isArray(result.components.schemas)).toBe(false);
  });

  it('should rewrite $refs that point at the bundleRoot, to #', () => {
    const document = {
      __target__: {
        type: 'object',
        properties: {
          circular: {
            $ref: '#/__target__',
          },
        },
      },
    };

    const result = bundleTarget({
      document,
      path: '#/__target__',
    });

    expect(result).toEqual({
      type: 'object',
      properties: {
        circular: {
          $ref: '#',
        },
      },
    });
  });

  it('should handle when the target is a direct $ref to itself', () => {
    const document = {
      __target__: {
        $ref: '#/__target__',
        description: 'Test',
      },
    };

    const result = bundleTarget({
      document,
      path: '#/__target__',
    });

    expect(result).toEqual({
      $ref: '#',
      description: 'Test',
    });
  });

  it('should handle and preserve circular indirect relationships', () => {
    const document = {
      definitions: {
        User: {
          $ref: '#/definitions/Editor',
          description: 'Some User with a basic set of permissions',
        },
        Admin: {
          $ref: '#/definitions/User',
          description: 'Some User with an elevated set of permissions',
        },
        Editor: {
          $ref: '#/definitions/Admin',
          description: 'Some User with write permissions',
        },
      },
      __target__: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/definitions/Editor',
          },
        },
        required: ['user'],
      },
    };

    const result = bundleTarget({
      document,
      path: '#/__target__',
    });

    expect(result).toEqual({
      type: 'object',
      properties: {
        user: {
          $ref: `#/${BUNDLE_ROOT}/Editor`,
        },
      },
      required: ['user'],
      [BUNDLE_ROOT]: {
        User: {
          $ref: `#/${BUNDLE_ROOT}/Editor`,
          description: 'Some User with a basic set of permissions',
        },
        Admin: {
          $ref: `#/${BUNDLE_ROOT}/User`,
          description: 'Some User with an elevated set of permissions',
        },
        Editor: {
          $ref: `#/${BUNDLE_ROOT}/Admin`,
          description: 'Some User with write permissions',
        },
      },
    });
  });

  describe('when custom keyProvider is provided', () => {
    it('should work', () => {
      const document = {
        definitions: {
          user: {
            id: 'foo',
            address: {
              $ref: '#/definitions/address',
            },
            'x-stoplight': { id: 'USER_ID' },
          },
          address: {
            street: 'foo',
            user: {
              $ref: '#/definitions/user',
            },
            city: {
              $ref: '#/definitions/city',
            },
            'x-stoplight': { id: 'ADDRESS_ID' },
          },
          city: {
            name: 'foo',
          },
          card: {
            zip: '20815',
            'x-stoplight': { id: 'CARD_ID' },
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

        /**
         * This example fetches the x-stoplight.id value from the object the ref path points at, and
         * returns that to use as the new $ref key in the bundled object (if id is present, otherwise falls back to default logic)
         */
        keyProvider: ({ document, path }) => {
          const target = _get(document, path);
          const id = target?.['x-stoplight']?.['id'];
          return id;
        },
      });

      // Do not mutate document
      expect(clone).toEqual(document);

      expect(result).toEqual({
        entity: {
          $ref: `#/${BUNDLE_ROOT}/USER_ID`,
        },
        [BUNDLE_ROOT]: {
          USER_ID: {
            id: 'foo',
            address: {
              $ref: `#/${BUNDLE_ROOT}/ADDRESS_ID`,
            },
            'x-stoplight': { id: 'USER_ID' },
          },
          ADDRESS_ID: {
            street: 'foo',
            user: {
              $ref: `#/${BUNDLE_ROOT}/USER_ID`,
            },
            city: {
              $ref: `#/${BUNDLE_ROOT}/city`,
            },
            'x-stoplight': { id: 'ADDRESS_ID' },
          },
          city: {
            name: 'foo',
          },
        },
      });
    });

    it('should increment key if duplicate', () => {
      const document = {
        definitions: {
          business_address: {
            id: 'foo',
            address: {
              $ref: '#/definitions/address',
            },
            'x-stoplight': { id: 'ADDRESS_ID' },
          },
          address: {
            street: 'foo',
            'x-stoplight': { id: 'ADDRESS_ID' },
          },
        },
        __target__: {
          entity1: {
            $ref: '#/definitions/business_address',
          },
          entity2: {
            $ref: '#/definitions/address',
          },
        },
      };

      const clone = cloneDeep(document);

      const result = bundleTarget({
        document: clone,
        path: '#/__target__',
        keyProvider: ({ document, path }) => {
          const target = _get(document, path);
          const id = target?.['x-stoplight']?.['id'];
          return id;
        },
      });

      // Do not mutate document
      expect(clone).toEqual(document);

      expect(result).toEqual({
        entity1: {
          $ref: `#/${BUNDLE_ROOT}/ADDRESS_ID`,
        },
        entity2: {
          $ref: `#/${BUNDLE_ROOT}/ADDRESS_ID_2`,
        },
        [BUNDLE_ROOT]: {
          ADDRESS_ID: {
            id: 'foo',
            address: {
              $ref: `#/${BUNDLE_ROOT}/ADDRESS_ID_2`,
            },
            'x-stoplight': { id: 'ADDRESS_ID' },
          },
          ADDRESS_ID_2: {
            street: 'foo',
            'x-stoplight': { id: 'ADDRESS_ID' },
          },
        },
      });
    });
  });

  describe('when custom bundleRoot is provided', () => {
    it('should work', () => {
      const bundleRoot = '#/__custom-root__';

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
        bundleRoot,
      });

      // Do not mutate document
      expect(clone).toStrictEqual(document);

      expect(result).toStrictEqual({
        entity: {
          $ref: `${bundleRoot}/user`,
        },
        '__custom-root__': {
          user: {
            id: 'foo',
            address: {
              $ref: `${bundleRoot}/address`,
            },
          },
          address: {
            street: 'foo',
            user: {
              $ref: `${bundleRoot}/user`,
            },
          },
        },
      });
    });

    it('should work for nested root', () => {
      const bundleRoot = '#/components/schemas';

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
        bundleRoot,
      });

      // Do not mutate document
      expect(clone).toStrictEqual(document);

      expect(result).toStrictEqual({
        entity: {
          $ref: `${bundleRoot}/user`,
        },
        components: {
          schemas: {
            user: {
              id: 'foo',
              address: {
                $ref: `${bundleRoot}/address`,
              },
            },
            address: {
              street: 'foo',
              user: {
                $ref: `${bundleRoot}/user`,
              },
            },
          },
        },
      });
    });

    it('should support bundleRoot that is a parent of target path', () => {
      const bundleRoot = '#/definitions';

      const document = {
        definitions: {
          embedded: {
            entity: {
              $ref: '#/definitions/user',
            },
          },
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
      };

      const clone = cloneDeep(document);

      const result = bundleTarget({
        document: clone,
        path: `${bundleRoot}/embedded`,
        bundleRoot,
      });

      // Do not mutate document
      expect(clone).toStrictEqual(document);

      expect(result).toStrictEqual({
        definitions: {
          address: {
            street: 'foo',
            user: {
              $ref: '#/definitions/user',
            },
          },
          user: {
            id: 'foo',
            address: {
              $ref: `${bundleRoot}/address`,
            },
          },
        },
        entity: {
          $ref: '#/definitions/user',
        },
      });
    });

    it('should generate unique keys', () => {
      const bundleRoot = '#/custom';

      const document = {
        custom: {
          largestCity: 'Tokyo',
          cities_0: 'Shanghai',
          cities_2: 'Sao Paulo',
        },
        definitions: {
          europe: {
            cities: ['Moscow', 'Berlin', 'Paris', 'Madrid', 'Rome'],
            largestCity: 'Moscow',
          },
          asean: {
            cities: ['Kuala Lumpur', 'Singapore', 'Hanoi', 'Vientiane', 'Bangkok', 'Jakarta'],
            largestCity: 'Jakarta',
          },
          us: {
            cities: ['Austin', 'Dallas', 'New York', 'Los Angeles', 'Las Vegas'],
            largestCity: 'New York',
          },
        },
        __target__: {
          largestCities: [
            {
              $ref: '#/definitions/asean/largestCity',
            },
            {
              $ref: '#/definitions/us/largestCity',
            },
            {
              $ref: '#/definitions/europe/largestCity',
            },
          ],
          cities: [
            {
              $ref: '#/definitions/us/cities/0',
            },
            {
              $ref: '#/definitions/asean/cities/0',
            },
            {
              $ref: '#/definitions/asean/cities/2',
            },
            {
              $ref: '#/definitions/us/cities/4',
            },
            {
              $ref: '#/definitions/asean/cities/3',
            },
            {
              $ref: '#/definitions/us/cities/3',
            },
            {
              $ref: '#/definitions/europe/cities/3',
            },
          ],
        },
      };

      const clone = cloneDeep(document);

      const result = bundleTarget({
        document: clone,
        path: '#/__target__',
        bundleRoot,
      });

      // Do not mutate document
      expect(clone).toStrictEqual(document);

      expect(result).toStrictEqual({
        custom: {
          cities_0: 'Austin',
          cities_0_2: 'Kuala Lumpur',
          cities_2: 'Hanoi',
          cities_3: 'Vientiane',
          cities_3_2: 'Los Angeles',
          cities_3_3: 'Madrid',
          cities_4: 'Las Vegas',
          largestCity: 'Jakarta',
          largestCity_2: 'New York',
          largestCity_3: 'Moscow',
        },
        largestCities: [
          {
            $ref: `${bundleRoot}/largestCity`,
          },
          {
            $ref: `${bundleRoot}/largestCity_2`,
          },
          {
            $ref: `${bundleRoot}/largestCity_3`,
          },
        ],
        cities: [
          {
            $ref: `${bundleRoot}/cities_0`,
          },
          {
            $ref: `${bundleRoot}/cities_0_2`,
          },
          {
            $ref: `${bundleRoot}/cities_2`,
          },
          {
            $ref: `${bundleRoot}/cities_4`,
          },
          {
            $ref: `${bundleRoot}/cities_3`,
          },
          {
            $ref: `${bundleRoot}/cities_3_2`,
          },
          {
            $ref: `${bundleRoot}/cities_3_3`,
          },
        ],
      });
    });

    it('should validate it against provided path', () => {
      expect(
        bundleTarget.bind(null, {
          document: {},
          path: '#/__target__',
          bundleRoot: '#/__target__',
        }),
      ).toThrow('Roots do not make any sense');

      expect(
        bundleTarget.bind(null, {
          document: {},
          path: '#/__target__/test',
          bundleRoot: '#/__target__',
        }),
      ).not.toThrow();
    });
  });

  describe('when custom errorsRoot is provided', () => {
    it('should work', () => {
      const document = {
        definitions: {
          invalidPointer: {
            $ref: '#./definitions/card',
          },
        },
        __target__: {
          entity: {
            $ref: '#/definitions/invalidPointer',
          },
        },
      };

      const result = bundleTarget({
        document: cloneDeep(document),
        path: '#/__target__',
        errorsRoot: '#/errors',
      });

      expect(result).toStrictEqual({
        __bundled__: {
          invalidPointer: {
            $ref: '#./definitions/card',
          },
        },
        entity: {
          $ref: '#/__bundled__/invalidPointer',
        },
        errors: {
          '#./definitions/card': 'Invalid JSON Pointer syntax.',
        },
      });
    });

    it('should work for nested root', () => {
      const document = {
        definitions: {
          invalidPointer: {
            $ref: '#./definitions/card',
          },
        },
        __target__: {
          entity: {
            $ref: '#/definitions/invalidPointer',
          },
        },
      };

      const result = bundleTarget({
        document: cloneDeep(document),
        path: '#/__target__',
        errorsRoot: '#/errors/bundling',
      });

      expect(result).toStrictEqual({
        __bundled__: {
          invalidPointer: {
            $ref: '#./definitions/card',
          },
        },
        entity: {
          $ref: '#/__bundled__/invalidPointer',
        },
        errors: {
          bundling: {
            '#./definitions/card': 'Invalid JSON Pointer syntax.',
          },
        },
      });
    });

    it('should not override existing property', () => {
      const document = {
        definitions: {
          invalidPointer: {
            $ref: '#./definitions/card',
          },
        },
        __target__: {
          entity: {
            $ref: '#/definitions/invalidPointer',
          },
        },
        errors: 'do not override me',
      };

      const result = bundleTarget({
        document: cloneDeep(document),
        path: '#/__target__',
        errorsRoot: '#/errors',
      });

      expect(result).toStrictEqual({
        __bundled__: {
          invalidPointer: {
            $ref: '#./definitions/card',
          },
        },
        entity: {
          $ref: '#/__bundled__/invalidPointer',
        },
        errors: 'do not override me',
      });
    });

    it('should validate it against provided path', () => {
      expect(
        bundleTarget.bind(null, {
          document: {},
          path: '#/__target__',
          errorsRoot: '#/__target__',
        }),
      ).toThrow('Roots do not make any sense');

      expect(
        bundleTarget.bind(null, {
          document: {},
          path: '#/__target__/test',
          errorsRoot: '#/__target__',
        }),
      ).not.toThrow();
    });
  });

});

it('whole document refs within a document are broken', () => {
  const petStore = {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger Petstore',
      description:
        'A sample API that uses a petstore as an example to demonstrate features in the OpenAPI 3.0 specification',
      termsOfService: 'http://swagger.io/terms/',
      contact: {
        name: 'Swagger API Team',
        email: 'apiteam@swagger.io',
        url: 'http://swagger.io',
      },
      license: {
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
        name: 'Apache 2.0',
      },
    },
    servers: [
      {
        url: 'http://petstore.swagger.io/api',
      },
    ],
    paths: {
    },
    components: {
      schemas: {
        Pet: {
          "$ref": "#",
        },
      },
    },
  };
  
  console.log(JSON.stringify(bundleTarget({ document: petStore, path: '#/components'}), null, 4));
});