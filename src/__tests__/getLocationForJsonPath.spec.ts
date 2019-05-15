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
      start       | end        | path
      ${[8, 21]}  | ${[8, 41]} | ${['info', 'contact', 'email']}
      ${[18, 8]}  | ${[25, 9]} | ${['tags', 0]}
      ${[18, 8]}  | ${[25, 9]} | ${['tags', 0, 0]}
      ${[18, 8]}  | ${[25, 9]} | ${['tags', 0, 'test', 'foo']}
      ${[26, 8]}  | ${[29, 9]} | ${['tags', 1]}
      ${[26, 8]}  | ${[29, 9]} | ${['tags', 1, -1]}
      ${[17, 12]} | ${[38, 5]} | ${['tags', 3, 'test', 'foo']}
      ${[39, 15]} | ${[42, 5]} | ${['schemes']}
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
      ${[10, 17]} | ${[12, 7]} | ${['users', 1, 'address']}
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
      start       | end         | path
      ${[42, 13]} | ${[73, 7]}  | ${['paths', '/todos/{todoId}', 'get']}
      ${[42, 13]} | ${[73, 7]}  | ${['paths', '/todos/{todoId}', 'get', 'description']}
      ${[74, 13]} | ${[125, 7]} | ${['paths', '/todos/{todoId}', 'put', 'description']}
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
});
