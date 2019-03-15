import * as fs from 'fs';
import { join } from 'path';
import { parseWithPointers } from '../parseWithPointers';

const simple = fs.readFileSync(join(__dirname, './fixtures/simple.json'), 'utf-8');

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
    ).toHaveProperty('validations', [
      expect.objectContaining({
        name: 'InvalidCommentToken',
        location: expect.objectContaining({
          start: expect.objectContaining({
            line: 2,
          }),
        }),
      }),
      expect.objectContaining({
        name: 'InvalidCommentToken',
        location: expect.objectContaining({
          start: expect.objectContaining({
            line: 4,
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
    ).toHaveProperty('validations', [
      expect.objectContaining({
        name: 'PropertyNameExpected',
        location: {
          start: expect.objectContaining({
            line: 4,
          }),
          end: expect.objectContaining({
            line: 4,
          }),
        },
      }),
      expect.objectContaining({
        name: 'ValueExpected',
        location: {
          start: expect.objectContaining({
            line: 4,
          }),
          end: expect.objectContaining({
            line: 4,
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
      const { getJsonPathForPosition } = parseWithPointers(`{
        "users": [
           {
             "name": "Joe",
             "address": {
               "city": "New York"
             } 
           },
           {
             "name": "Chris",
             "address": {
               "city": "Dallas"
             } 
           }
          ]
        } `);
      expect(
        getJsonPathForPosition({
          line: 5,
          character: 17,
        })
      ).toEqual(['users', 0, 'address', 'city']);
    });
  });
});
