import * as fs from 'fs';
import { join } from 'path';
import { parseWithPointers } from '../parseWithPointers';

const simple = fs.readFileSync(join(__dirname, './fixtures/simple.json'), 'utf-8');
const users = fs.readFileSync(join(__dirname, './fixtures/users.json'), 'utf-8');
const multilineComments = fs.readFileSync(join(__dirname, './fixtures/multiline-comments.json'), 'utf-8');

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
    test.each(['main.oas2.json', 'user.jschema.json'])('parses %s', async filename => {
      expect(
        parseWithPointers((await fs.promises.readFile(join(__dirname, 'fixtures', filename), 'utf-8')) as string)
      ).toMatchSnapshot();
    });
  });

  describe('invalid fixtures', () => {
    test.each(['schema.json', 'characters.json'])('parses %s', async filename => {
      expect(
        parseWithPointers((await fs.promises.readFile(
          join(__dirname, 'fixtures/invalid', filename),
          'utf-8'
        )) as string)
      ).toMatchSnapshot();
    });
  });

  describe('getJsonPathForPosition', () => {
    describe('simple fixture', () => {
      const { getJsonPathForPosition } = parseWithPointers(simple);

      test.each`
        line | character | path
        ${0} | ${0}      | ${[]}
        ${1} | ${4}      | ${['hello']}
        ${1} | ${17}     | ${['hello']}
        ${3} | ${5}      | ${['address', 'street']}
        ${8} | ${20}     | ${['paths', '/users/{id}', 'get', 'operationId']}
      `('should return proper json path for line $line and character $character', ({ line, character, path }) => {
        expect(getJsonPathForPosition({ line, character })).toEqual(path);
      });
    });

    describe('users fixture', () => {
      const { getJsonPathForPosition } = parseWithPointers(users);

      test.each`
        line | character | path
        ${0} | ${0}      | ${[]}
        ${2} | ${0}      | ${['users']}
        ${2} | ${5}      | ${['users', 0]}
        ${5} | ${17}     | ${['users', 0, 'address', 'city']}
        ${9} | ${12}     | ${['users', 1, 'name']}
      `('should return proper json path for line $line and character $character', ({ line, character, path }) => {
        expect(getJsonPathForPosition({ line, character })).toEqual(path);
      });
    });

    describe('one-liner', () => {
      const { getJsonPathForPosition } = parseWithPointers(`{ "foo": true, "bar": false }`);

      test.each`
        line | character | path
        ${0} | ${3}      | ${['foo']}
        ${0} | ${12}     | ${['foo']}
        ${0} | ${17}     | ${['bar']}
      `('should return proper json path for line $line and character $character', ({ line, character, path }) => {
        expect(getJsonPathForPosition({ line, character })).toEqual(path);
      });
    });

    describe('multiline comments', () => {
      const { getJsonPathForPosition } = parseWithPointers(multilineComments);

      test.each`
        line  | character | path
        ${1}  | ${4}      | ${['hello']}
        ${7}  | ${5}      | ${['address', 'street']}
        ${14} | ${20}     | ${['paths', '/users/{id}', 'get', 'operationId']}
      `('should return proper json path for line $line and character $character', ({ line, character, path }) => {
        expect(getJsonPathForPosition({ line, character })).toEqual(path);
      });
    });
  });

  describe('getLocationForJsonPath', () => {
    describe('simple fixture', () => {
      const { getLocationForJsonPath } = parseWithPointers(simple);

      test.each`
        start      | end        | path
        ${[2, 13]} | ${[4, 3]}  | ${['address']}
        ${[3, 15]} | ${[3, 18]} | ${['address', 'street']}
        ${[6, 19]} | ${[10, 5]} | ${['paths', '/users/{id}']}
        ${[8, 24]} | ${[8, 34]} | ${['paths', '/users/{id}', 'get', 'operationId']}
      `('should return proper location for given JSONPath $path', ({ start, end, path }) => {
        expect(getLocationForJsonPath(path)).toEqual({
          range: {
            start: {
              character: start[1],
              line: start[0],
            },
            end: {
              character: end[1],
              line: end[0],
            },
          },
        });
      });
    });

    describe('users fixture', () => {
      const { getLocationForJsonPath } = parseWithPointers(users);

      test.each`
        start       | end        | path
        ${[3, 15]}  | ${[3, 20]} | ${['users', 0, 'name']}
        ${[10, 17]} | ${[12, 7]} | ${['users', 1, 'address']}
      `('should return proper location for given JSONPath $path', ({ start, end, path }) => {
        expect(getLocationForJsonPath(path)).toEqual({
          range: {
            start: {
              character: start[1],
              line: start[0],
            },
            end: {
              character: end[1],
              line: end[0],
            },
          },
        });
      });
    });

    describe('one-liner', () => {
      const { getLocationForJsonPath } = parseWithPointers(`{ "foo": true, "bar": false }`);

      test.each`
        start      | end        | path
        ${[0, 9]}  | ${[0, 13]} | ${['foo']}
        ${[0, 22]} | ${[0, 27]} | ${['bar']}
      `('should return proper location for given JSONPath $path', ({ start, end, path }) => {
        expect(getLocationForJsonPath(path)).toEqual({
          range: {
            start: {
              character: start[1],
              line: start[0],
            },
            end: {
              character: end[1],
              line: end[0],
            },
          },
        });
      });
    });

    describe('multiline comments', () => {
      const { getLocationForJsonPath } = parseWithPointers(multilineComments);

      test.each`
        start       | end         | path
        ${[1, 12]}  | ${[1, 19]}  | ${['hello']}
        ${[7, 15]}  | ${[7, 18]}  | ${['address', 'street']}
        ${[13, 13]} | ${[15, 7]}  | ${['paths', '/users/{id}', 'get']}
        ${[14, 24]} | ${[14, 34]} | ${['paths', '/users/{id}', 'get', 'operationId']}
      `('should return proper location for given JSONPath $path', ({ start, end, path }) => {
        expect(getLocationForJsonPath(path)).toEqual({
          range: {
            start: {
              character: start[1],
              line: start[0],
            },
            end: {
              character: end[1],
              line: end[0],
            },
          },
        });
      });
    });
  });
});
