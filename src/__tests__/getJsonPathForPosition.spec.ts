import * as fs from 'fs';
import { join } from 'path';
import { getJsonPathForPosition } from '../getJsonPathForPosition';
import { parseWithPointers } from '../parseWithPointers';

const simple = fs.readFileSync(join(__dirname, './fixtures/simple.json'), 'utf-8');
const users = fs.readFileSync(join(__dirname, './fixtures/users.json'), 'utf-8');
const multilineComments = fs.readFileSync(join(__dirname, './fixtures/multiline-comments.json'), 'utf-8');

describe('getJsonPathForPosition', () => {
  describe('simple fixture', () => {
    const result = parseWithPointers(simple);

    test.each`
      line | character | path
      ${0} | ${0}      | ${[]}
      ${1} | ${4}      | ${['hello']}
      ${1} | ${17}     | ${['hello']}
      ${3} | ${5}      | ${['address', 'street']}
      ${8} | ${20}     | ${['paths', '/users/{id}', 'get', 'operationId']}
    `('should return proper json path for line $line and character $character', ({ line, character, path }) => {
      expect(getJsonPathForPosition(result, { line, character })).toEqual(path);
    });
  });

  describe('users fixture', () => {
    const result = parseWithPointers(users);

    test.each`
      line | character | path
      ${0} | ${0}      | ${[]}
      ${0} | ${231}    | ${[]}
      ${2} | ${0}      | ${['users']}
      ${2} | ${3}      | ${['users']}
      ${2} | ${5}      | ${['users', 0]}
      ${5} | ${17}     | ${['users', 0, 'address', 'city']}
      ${9} | ${12}     | ${['users', 1, 'name']}
    `('should return proper json path for line $line and character $character', ({ line, character, path }) => {
      expect(getJsonPathForPosition(result, { line, character })).toEqual(path);
    });
  });

  describe('one-liner', () => {
    const result = parseWithPointers(`{ "foo": true, "bar": false }`);

    test.each`
      line | character | path
      ${0} | ${3}      | ${['foo']}
      ${0} | ${12}     | ${['foo']}
      ${0} | ${17}     | ${['bar']}
    `('should return proper json path for line $line and character $character', ({ line, character, path }) => {
      expect(getJsonPathForPosition(result, { line, character })).toEqual(path);
    });
  });

  describe('multiline comments', () => {
    const result = parseWithPointers(multilineComments);

    test.each`
      line  | character | path
      ${1}  | ${4}      | ${['hello']}
      ${7}  | ${5}      | ${['address', 'street']}
      ${14} | ${20}     | ${['paths', '/users/{id}', 'get', 'operationId']}
    `('should return proper json path for line $line and character $character', ({ line, character, path }) => {
      expect(getJsonPathForPosition(result, { line, character })).toEqual(path);
    });
  });
});
