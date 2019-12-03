import { DiagnosticSeverity } from '@stoplight/types';
import * as fs from 'fs';
import { join } from 'path';
import { parseWithPointers } from '../parseWithPointers';

const simple = fs.readFileSync(join(__dirname, './fixtures/simple.json'), 'utf-8');

describe('json parser', () => {
  test('parse simple', () => {
    expect(parseWithPointers(simple)).toMatchSnapshot({
      ast: expect.any(Object),
      lineMap: expect.any(Array),
    });
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
}`),
    ).toMatchSnapshot({
      ast: expect.any(Object),
      lineMap: expect.any(Array),
    });
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
    }`),
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
    }`),
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
    test.each(['petstore.oas2.json', 'user.jschema.json'])('parses %s', async filename => {
      expect(
        parseWithPointers((await fs.promises.readFile(join(__dirname, 'fixtures', filename), 'utf-8')) as string),
      ).toMatchSnapshot({
        ast: expect.any(Object),
        lineMap: expect.any(Array),
      });
    });
  });

  describe('invalid fixtures', () => {
    test.each(['schema.json', 'characters.json'])('parses %s', async filename => {
      expect(
        parseWithPointers((await fs.promises.readFile(
          join(__dirname, 'fixtures/invalid', filename),
          'utf-8',
        )) as string),
      ).toMatchSnapshot({
        ast: expect.any(Object),
        lineMap: expect.any(Array),
      });
    });
  });

  describe('duplicate keys', () => {
    test('given object with no duplicate keys, does not report any errors', () => {
      expect(
        parseWithPointers(
          `{
  "type": "object",
  "properties": {
    "bike": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "type": {
          "type": "string"
        }
      },
      "required": ["id"]
    }
  }
}`,
          { ignoreDuplicateKeys: false },
        ).diagnostics,
      ).toEqual([]);

      expect(
        parseWithPointers(
          `{
  "type": "object",
  "properties": [{
    "maxLength": {
      "type": "string",
      "maxLength": 1
    },
    "type": {
      "type": "string"
    }
  }, {
    "maxLength": {
      "type": "string",
      "maxLength": 1
    },
    "type": {
      "type": "string"
    }
  }]
}`,
          { ignoreDuplicateKeys: false },
        ).diagnostics,
      ).toEqual([]);
    });

    test('given object containing with duplicate keys, reports them', () => {
      expect(
        parseWithPointers(
          `{
  "type": "object",
  "properties": {
    "bike": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "type": {
          "type": "string",
          "type": "object"
        },
        "id": ""
      },
      "required": ["id"]
    }
  }
}`,
          { ignoreDuplicateKeys: false },
        ).diagnostics,
      ).toEqual([
        {
          code: 20,
          message: 'DuplicateKey',
          path: ['properties', 'bike', 'properties', 'type', 'type'],
          range: {
            end: {
              character: 16,
              line: 11,
            },
            start: {
              character: 10,
              line: 11,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: 20,
          message: 'DuplicateKey',
          path: ['properties', 'bike', 'properties', 'id'],
          range: {
            end: {
              character: 12,
              line: 13,
            },
            start: {
              character: 8,
              line: 13,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
      ]);

      expect(
        parseWithPointers('{ "foo": true, "foo": false,\n "foo": 2, "bar": true }', { ignoreDuplicateKeys: false }),
      ).toHaveProperty('diagnostics', [
        {
          code: 20,
          message: 'DuplicateKey',
          path: ['foo'],
          range: {
            start: {
              line: 0,
              character: 15,
            },
            end: {
              line: 0,
              character: 20,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
        {
          code: 20,
          message: 'DuplicateKey',
          path: ['foo'],
          range: {
            start: {
              line: 1,
              character: 1,
            },
            end: {
              line: 1,
              character: 6,
            },
          },
          severity: DiagnosticSeverity.Error,
        },
      ]);
    });

    test('generates correct paths for dupes in arrays', () => {
      expect(
        parseWithPointers('{ "A": [{}, { "foo": true, "foo": false,\n "foo": 2 }] }', { ignoreDuplicateKeys: false }),
      ).toHaveProperty('diagnostics', [
        expect.objectContaining({
          code: 20,
          message: 'DuplicateKey',
          path: ['A', 1, 'foo'],
        }),
        expect.objectContaining({
          code: 20,
          message: 'DuplicateKey',
          path: ['A', 1, 'foo'],
        }),
      ]);

      expect(
        parseWithPointers('[{ "A": [{}, {}, { "foo": true, "foo": false,\n "foo": 2 }] }]', {
          ignoreDuplicateKeys: false,
        }),
      ).toHaveProperty('diagnostics', [
        expect.objectContaining({
          code: 20,
          message: 'DuplicateKey',
          path: [0, 'A', 2, 'foo'],
        }),
        expect.objectContaining({
          code: 20,
          message: 'DuplicateKey',
          path: [0, 'A', 2, 'foo'],
        }),
      ]);
    });
  });

  test('includes properties with empty string as keys', () => {
    expect(parseWithPointers('{ "": [{ "foo": true, "": false }] }')).toHaveProperty('data', {
      '': [{ '': false, foo: true }],
    });
  });
});
