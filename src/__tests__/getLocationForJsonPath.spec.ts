import * as fs from 'fs';
import { join } from 'path';
import { getLocationForJsonPath } from '../getLocationForJsonPath';
import { parseWithPointers } from '../parseWithPointers';

const simple = fs.readFileSync(join(__dirname, './fixtures/simple.json'), 'utf-8');
const users = fs.readFileSync(join(__dirname, './fixtures/users.json'), 'utf-8');
const multilineComments = fs.readFileSync(join(__dirname, './fixtures/multiline-comments.json'), 'utf-8');
const petStore = fs.readFileSync(join(__dirname, './fixtures/petstore.oas2.json'), 'utf-8');
const todos = fs.readFileSync(join(__dirname, './fixtures/todos.oas2.json'), 'utf-8');

describe('getLocationForJsonPath', () => {
  describe('pet store fixture', () => {
    const result = parseWithPointers(petStore);

    test.each`
      start       | end        | path                                   | closest
      ${[8, 21]}  | ${[8, 41]} | ${['info', 'contact', 'email']}        | ${false}
      ${[8, 21]}  | ${[8, 41]} | ${['info', 'contact', 'email']}        | ${true}
      ${[]}       | ${[]}      | ${['info', 'contact', 'email', 'foo']} | ${false}
      ${[8, 21]}  | ${[8, 41]} | ${['info', 'contact', 'email', 'foo']} | ${true}
      ${[18, 8]}  | ${[25, 9]} | ${['tags', 0]}                         | ${false}
      ${[]}       | ${[]}      | ${['tags', 0, 0]}                      | ${false}
      ${[18, 8]}  | ${[25, 9]} | ${['tags', 0, 0]}                      | ${true}
      ${[]}       | ${[]}      | ${['tags', 0, 'test', 'foo']}          | ${false}
      ${[18, 8]}  | ${[25, 9]} | ${['tags', 0, 'test', 'foo']}          | ${true}
      ${[26, 8]}  | ${[29, 9]} | ${['tags', 1]}                         | ${false}
      ${[]}       | ${[]}      | ${['tags', 1, -1]}                     | ${false}
      ${[26, 8]}  | ${[29, 9]} | ${['tags', 1, -1]}                     | ${true}
      ${[17, 12]} | ${[38, 5]} | ${['tags', 3, 'test', 'foo']}          | ${true}
      ${[39, 15]} | ${[42, 5]} | ${['schemes']}                         | ${false}
      ${[39, 15]} | ${[42, 5]} | ${['schemes']}                         | ${true}
    `('should return proper location for given JSONPath $path', ({ start, end, path, closest }) => {
      expect(getLocationForJsonPath(result, path, closest)).toEqual(
        start.length > 0 && end.length > 0
          ? {
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
            }
          : void 0,
      );
    });
  });

  describe('simple fixture', () => {
    const result = parseWithPointers(simple);

    test.each`
      start      | end        | path
      ${[2, 13]} | ${[4, 3]}  | ${['address']}
      ${[3, 14]} | ${[3, 17]} | ${['address', 'street']}
      ${[6, 19]} | ${[10, 5]} | ${['paths', '/users/{id}']}
      ${[8, 23]} | ${[8, 33]} | ${['paths', '/users/{id}', 'get', 'operationId']}
    `('should return proper location for given JSONPath $path', ({ start, end, path }) => {
      expect(getLocationForJsonPath(result, path)).toEqual({
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
    const result = parseWithPointers(users);

    test.each`
      start       | end        | path
      ${[3, 14]}  | ${[3, 19]} | ${['users', 0, 'name']}
      ${[3, 14]}  | ${[3, 19]} | ${['users', '0', 'name']}
      ${[10, 17]} | ${[12, 7]} | ${['users', 1, 'address']}
      ${[10, 17]} | ${[12, 7]} | ${['users', '1', 'address']}
    `('should return proper location for given JSONPath $path', ({ start, end, path }) => {
      expect(getLocationForJsonPath(result, path)).toEqual({
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
    const result = parseWithPointers(`{ "foo": true, "bar": false }`);

    test.each`
      start      | end        | path
      ${[0, 9]}  | ${[0, 13]} | ${['foo']}
      ${[0, 22]} | ${[0, 27]} | ${['bar']}
    `('should return proper location for given JSONPath $path', ({ start, end, path }) => {
      expect(getLocationForJsonPath(result, path)).toEqual({
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
    const result = parseWithPointers(multilineComments);

    test.each`
      start       | end         | path
      ${[1, 11]}  | ${[1, 18]}  | ${['hello']}
      ${[7, 14]}  | ${[7, 17]}  | ${['address', 'street']}
      ${[13, 13]} | ${[15, 7]}  | ${['paths', '/users/{id}', 'get']}
      ${[14, 23]} | ${[14, 33]} | ${['paths', '/users/{id}', 'get', 'operationId']}
    `('should return proper location for given JSONPath $path', ({ start, end, path }) => {
      expect(getLocationForJsonPath(result, path)).toEqual({
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

  describe('todos', () => {
    const result = parseWithPointers(todos);

    test.each`
      start       | end         | path                                                  | closest
      ${[42, 13]} | ${[73, 7]}  | ${['paths', '/todos/{todoId}', 'get']}                | ${false}
      ${[42, 13]} | ${[73, 7]}  | ${['paths', '/todos/{todoId}', 'get', 'description']} | ${true}
      ${[]}       | ${[]}       | ${['paths', '/todos/{todoId}', 'get', 'description']} | ${false}
      ${[74, 13]} | ${[125, 7]} | ${['paths', '/todos/{todoId}', 'put', 'description']} | ${true}
      ${[]}       | ${[]}       | ${['paths', '/todos/{todoId}', 'put', 'description']} | ${false}
    `('should return proper location for given JSONPath $path', ({ start, end, path, closest }) => {
      expect(getLocationForJsonPath(result, path, closest)).toEqual(
        start.length > 0 && end.length > 0
          ? {
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
            }
          : undefined,
      );
    });
  });
});
