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
}`)
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
    test.each(['petstore.oas2.json', 'user.jschema.json'])('parses %s', async filename => {
      expect(
        parseWithPointers((await fs.promises.readFile(join(__dirname, 'fixtures', filename), 'utf-8')) as string)
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
          'utf-8'
        )) as string)
      ).toMatchSnapshot({
        ast: expect.any(Object),
        lineMap: expect.any(Array),
      });
    });
  });

  test('reports duplicated properties', () => {
    expect(
      parseWithPointers('{ "foo": true, "foo": false,\n "foo": 2, "bar": true }', { ignoreDuplicateKeys: false })
    ).toHaveProperty('diagnostics', [
      {
        code: 20,
        message: 'Duplicated property',
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
        message: 'Duplicated property',
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
});
