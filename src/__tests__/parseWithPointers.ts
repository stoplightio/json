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
});
