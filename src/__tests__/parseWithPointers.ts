import * as fs from 'fs';
import { join } from 'path';
import { parseWithPointers } from '../parseWithPointers';

const simple = fs.readFileSync(join(__dirname, './fixtures/simple.json'), 'utf-8');
const users = fs.readFileSync(join(__dirname, './fixtures/users.json'), 'utf-8');

describe('json parser', () => {
  test('parse simple', () => {
    expect(parseWithPointers(simple)).toMatchSnapshot();
  });

  test('parse complex', () => {
    expect(
      parseWithPointers(`{
  "users": [
    {
      "name": "Markku",
      "address": {
         "country": "Finland",
         "city": "Helsinki"
       },
      "age": 17,
      "adult": false
    },
    {
      "name": "Dennis",
      "country": "Denmark",
      "age": 18,
      "adult": true
    }
  ]
}`)
    ).toMatchSnapshot();
  });

  test('does not allow comments by default', () => {
    expect(
      parseWithPointers(`{
      // a comment
      "name": "Antti",
      /* a
       very
       block 
       comment  
       */
      "city": "Vantaa"
    }`)
    ).toHaveProperty('diagnostics', [
      expect.objectContaining({
        message: 'InvalidCommentToken',
        range: expect.objectContaining({
          start: expect.objectContaining({
            line: 1,
          }),
        }),
      }),
      expect.objectContaining({
        message: 'InvalidCommentToken',
        range: expect.objectContaining({
          start: expect.objectContaining({
            line: 3,
          }),
        }),
      }),
    ]);
  });

  test('does not allow trailing commas by default', () => {
    expect(
      parseWithPointers(`{
      "name": "Antti",
       "city": "Vantaa",
    }`)
    ).toHaveProperty('diagnostics', [
      expect.objectContaining({
        message: 'PropertyNameExpected',
        range: {
          start: expect.objectContaining({
            line: 3,
          }),
          end: expect.objectContaining({
            line: 3,
          }),
        },
      }),
      expect.objectContaining({
        message: 'ValueExpected',
        range: {
          start: expect.objectContaining({
            line: 3,
          }),
          end: expect.objectContaining({
            line: 3,
          }),
        },
      }),
    ]);
  });

  describe('fixtures', () => {
    it.each(['main.oas2.json', 'user.jschema.json'])('parses %s', async filename => {
      expect(
        parseWithPointers((await fs.promises.readFile(join(__dirname, 'fixtures', filename), 'utf-8')) as string)
      ).toMatchSnapshot();
    });
  });

  describe('invalid fixtures', () => {
    it.each(['schema.json', 'characters.json'])('parses %s', async filename => {
      expect(
        parseWithPointers((await fs.promises.readFile(
          join(__dirname, 'fixtures/invalid', filename),
          'utf-8'
        )) as string)
      ).toMatchSnapshot();
    });
  });

  describe('getJsonPathForPosition', () => {
    test('simple', () => {
      const { getJsonPathForPosition } = parseWithPointers(simple);
      expect(
        getJsonPathForPosition({
          line: 3,
          character: 5,
        })
      ).toEqual(['address', 'street']);
      expect(
        getJsonPathForPosition({
          line: 1,
          character: 4,
        })
      ).toEqual(['hello']);
      expect(
        getJsonPathForPosition({
          line: 8,
          character: 20,
        })
      ).toEqual(['paths', '/users/{id}', 'get', 'operationId']);
    });

    test('arrays', () => {
      const { getJsonPathForPosition } = parseWithPointers(users);
      expect(
        getJsonPathForPosition({
          line: 5,
          character: 17,
        })
      ).toEqual(['users', 0, 'address', 'city']);
    });

    test('one-liner', () => {
      const { getJsonPathForPosition } = parseWithPointers(`{ "foo": true, "bar": false }`);
      expect(
        getJsonPathForPosition({
          line: 0,
          character: 3,
        })
      ).toEqual(['foo']);
    });
  });

  describe('getLocationForJsonPath', () => {
    test('simple', () => {
      const { getLocationForJsonPath } = parseWithPointers(simple);
      expect(getLocationForJsonPath(['address', 'street'])).toMatchObject({
        range: {
          start: {
            character: 15,
            line: 3,
          },
          end: {
            character: 18,
            line: 3,
          },
        },
      });
      expect(getLocationForJsonPath(['address'])).toMatchObject({
        range: {
          start: {
            character: 13,
            line: 2,
          },
          end: {
            character: 3,
            line: 4,
          },
        },
      });
      expect(getLocationForJsonPath(['paths', '/users/{id}', 'get', 'operationId'])).toMatchObject({
        range: {
          start: {
            character: 24,
            line: 8,
          },
          end: {
            character: 34,
            line: 8,
          },
        },
      });
      expect(getLocationForJsonPath(['paths', '/users/{id}', 'get', 'operationId'])).toMatchObject({
        range: {
          start: {
            character: 24,
            line: 8,
          },
          end: {
            character: 34,
            line: 8,
          },
        },
      });
      expect(getLocationForJsonPath(['paths', '/users/{id}'])).toMatchObject({
        range: {
          start: {
            character: 19,
            line: 6,
          },
          end: {
            character: 5,
            line: 10,
          },
        },
      });
    });

    test('arrays', () => {
      const { getLocationForJsonPath } = parseWithPointers(users);
      expect(getLocationForJsonPath(['users', 0, 'name'])).toMatchObject({
        range: {
          start: {
            character: 15,
            line: 3,
          },
          end: {
            character: 20,
            line: 3,
          },
        },
      });
      expect(getLocationForJsonPath(['users', 1, 'address'])).toMatchObject({
        range: {
          start: {
            character: 17,
            line: 10,
          },
          end: {
            character: 7,
            line: 12,
          },
        },
      });
    });

    test('one-liner', () => {
      const { getLocationForJsonPath } = parseWithPointers(`{ "foo": true, "bar": false }`);
      expect(getLocationForJsonPath(['bar'])).toMatchObject({
        range: {
          start: {
            character: 22,
            line: 0,
          },
          end: {
            character: 27,
            line: 0,
          },
        },
      });
    });
  });
});
