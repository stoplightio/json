import * as fs from 'fs';
import { join } from 'path';
import { parseWithPointers } from '../parseWithPointers';

describe('json parser', () => {
  test('parse simple', () => {
    expect(
      parseWithPointers(`{
  "hello": "world",
  "address": {
    "street": 123
  },
  "paths": {
    "/users/{id}": {
      "get": {
        "operationId": "get-user"
      }
    }
  }
}`)
    ).toMatchSnapshot();
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
        parseWithPointers((await fs.promises.readFile(join(__dirname, 'fixtures/invalid', filename), 'utf-8')) as string)
      ).toMatchSnapshot();
    });
  });
});
