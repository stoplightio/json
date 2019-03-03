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

  describe('invalid fixtures', () => {
    it.each(['invalid-schema.json'])('parses %s', async filename => {
      expect(
        parseWithPointers((await fs.promises.readFile(join(__dirname, 'fixtures/', filename), 'utf-8')) as string)
      ).toMatchSnapshot();
    });
  });
});
