import { resolveExternalRef, resolveExternalRefWithLocation } from '../resolvers/resolveExternalRef';

describe('resolveExternalRef', () => {
  it('should follow refs', async () => {
    const inventory = {
      'docA.yaml': {
        $ref: 'docB.yaml#/foo',
      },
      'docB.yaml': {
        $ref: './docC.yaml#',
      },
      'docC.yaml': {
        $ref: 'docD.yaml#/0',
      },
      'docD.yaml': [
        {
          foo: 'woo!',
        },
      ],
    };

    await expect(resolveExternalRef(inventory, 'docA.yaml', '#')).resolves.toEqual('woo!');
    await expect(resolveExternalRefWithLocation(inventory, 'docA.yaml', '#')).resolves.toEqual({
      location: ['0', 'foo'],
      source: 'docD.yaml',
      value: 'woo!',
    });
  });

  it('should handle direct circular refs', async () => {
    const inventory = {
      a: {
        $ref: 'b#',
      },
      b: {
        $ref: 'a#',
      },
    };

    await expect(resolveExternalRef(inventory, 'a', '#')).resolves.toEqual({
      $ref: 'a#',
    });

    await expect(resolveExternalRefWithLocation(inventory, 'a', '#')).resolves.toEqual({
      source: 'b',
      location: [],
      value: {
        $ref: 'a#',
      },
    });
  });

  it('should handle direct circular refs #2', async () => {
    const inventory = {
      a: {
        $ref: 'b#/foo',
      },
      b: {
        foo: {
          $ref: 'c#',
        },
        bar: {
          $ref: 'e#',
        },
      },
      c: {
        $ref: 'b#/bar',
      },
      e: {
        $ref: 'a#',
      },
    };

    await expect(resolveExternalRef(inventory, 'a', '#')).resolves.toEqual({
      $ref: 'a#',
    });
    await expect(resolveExternalRefWithLocation(inventory, 'a', '#')).resolves.toEqual({
      source: 'e',
      location: [],
      value: {
        $ref: 'a#',
      },
    });
  });

  it('should handle direct circular refs #3', async () => {
    const inventory = {
      a: {
        $ref: 'a#',
      },
      b: {
        $ref: 'a#',
      },
    };

    await expect(resolveExternalRef(inventory, 'a', '#')).resolves.toEqual({
      $ref: 'a#',
    });

    await expect(resolveExternalRefWithLocation(inventory, 'a', '#')).resolves.toEqual({
      source: 'a',
      location: [],
      value: {
        $ref: 'a#',
      },
    });
  });

  it('given missing segment, should throw', async () => {
    const inventory = {
      a: {
        $ref: 'b#/foo',
      },
      b: {
        bar: false,
      },
    };

    await expect(resolveExternalRef(inventory, 'a', '#')).rejects.toThrowError("Could not resolve '#/foo'");
  });

  it('given path pointing at invalid data, should throw', async () => {
    const inventory = {
      a: {
        $ref: 'b#/foo/bar',
      },
      b: {
        foo: null,
      },
    };

    await expect(resolveExternalRef(inventory, 'a', '#')).rejects.toThrowError("Could not resolve '#/foo/bar'");
  });

  it('given invalid $ref type, should throw', async () => {
    const inventory = {
      a: {
        $ref: 2,
      },
    };

    await expect(resolveExternalRef(inventory, 'a', '#')).rejects.toThrowError('$ref should be a string');
  });

  it('the examples should not be changed', async () => {
    const inventory = {
      a: {
        AAAAA: {
          $ref: 'b#/components/schemas/referenced',
          description: 'AAAAA',
          examples: ['AAAAA'],
        },
        BBBBB: {
          $ref: 'b#/components/schemas/referenced',
          description: 'BBBBB',
          examples: ['BBBBB'],
        },
      },
      b: {
        components: {
          schemas: {
            referenced: {
              type: 'string',
              title: 'referenced',
            },
          },
        },
      },
    };

    await expect(resolveExternalRef(inventory, 'a', '#')).resolves.toEqual({
      AAAAA: {
        $ref: 'b#/components/schemas/referenced',
        description: 'AAAAA',
        examples: ['AAAAA'],
      },
      BBBBB: {
        $ref: 'b#/components/schemas/referenced',
        description: 'BBBBB',
        examples: ['BBBBB'],
      },
    });
  });
});
