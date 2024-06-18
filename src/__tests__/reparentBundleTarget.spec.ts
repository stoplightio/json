import { describe, expect, it } from 'vitest';

import { reparentBundleTarget } from '../reparentBundleTarget';

describe('reparentBundleTarget', () => {
  it.each<[string, string]>([
    ['#', '#/components'],
    ['#/components', '#'],
    ['#/components/schemas', '#/components'],
  ])('given %p paths, should throw', (from, to) => {
    expect(reparentBundleTarget.bind(null, {}, from, to)).toThrow();
  });

  it('should reparent refs', () => {
    const document = {
      properties: {
        user: {
          $ref: '#/definitions/User',
        },
      },
      definitions: {
        Name: {
          type: 'string',
        },
        Admin: {
          properties: {
            name: {
              $ref: '#/definitions/Name',
            },
          },
        },
        Editor: {
          properties: {
            name: {
              $ref: '#/definitions/Name',
            },
          },
        },
        Users: {
          oneOf: [
            {
              $ref: '#/definitions/Admin',
            },
            {
              $ref: '#/definitions/Editor',
            },
          ],
        },
      },
    };

    reparentBundleTarget(document, '#/definitions', '#/$defs');

    expect(document).toStrictEqual({
      properties: {
        user: {
          $ref: '#/$defs/User',
        },
      },
      $defs: {
        Name: {
          type: 'string',
        },
        Admin: {
          properties: {
            name: {
              $ref: '#/$defs/Name',
            },
          },
        },
        Editor: {
          properties: {
            name: {
              $ref: '#/$defs/Name',
            },
          },
        },
        Users: {
          oneOf: [
            {
              $ref: '#/$defs/Admin',
            },
            {
              $ref: '#/$defs/Editor',
            },
          ],
        },
      },
    });
  });

  it('given missing source, should do nothing', () => {
    const document = {
      properties: {
        user: {
          $ref: '#/definitions/User',
        },
      },
      definitions: {},
    };

    reparentBundleTarget(document, '#/components/schemas', '#/$defs');

    expect(document).toStrictEqual({
      properties: {
        user: {
          $ref: '#/definitions/User',
        },
      },
      definitions: {},
    });
  });

  it('given invalid source, should do nothing', () => {
    let document: Record<string, unknown> = {
      properties: {
        user: {
          $ref: '#/definitions/User',
        },
      },
      components: null,
    };

    reparentBundleTarget(document, '#/components/schemas', '#/$defs');

    expect(document).toStrictEqual({
      properties: {
        user: {
          $ref: '#/definitions/User',
        },
      },
      components: null,
    });

    document = {
      properties: {
        user: {
          $ref: '#/definitions/User',
        },
      },
      components: {
        schemas: null,
      },
    };

    reparentBundleTarget(document, '#/components/schemas', '#/$defs');

    expect(document).toStrictEqual({
      properties: {
        user: {
          $ref: '#/definitions/User',
        },
      },
      components: {
        schemas: null,
      },
    });
  });

  it('given existing target, should do nothing', () => {
    const document = {
      properties: {
        user: {
          $ref: '#/definitions/User',
        },
      },
      $defs: {},
      definitions: {
        Name: {
          type: 'string',
        },
        Admin: {
          properties: {
            name: {
              $ref: '#/definitions/Name',
            },
          },
        },
      },
    };

    reparentBundleTarget(document, '#/definitions', '#/$defs');

    expect(document).toStrictEqual({
      properties: {
        user: {
          $ref: '#/definitions/User',
        },
      },
      $defs: {},
      definitions: {
        Name: {
          type: 'string',
        },
        Admin: {
          properties: {
            name: {
              $ref: '#/definitions/Name',
            },
          },
        },
      },
    });
  });
});
