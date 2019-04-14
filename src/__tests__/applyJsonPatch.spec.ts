import * as fs from 'fs';
import { join } from 'path';
import { applyJsonPatch, PatchTypes } from '../applyJsonPatch';
import { parseWithPointers } from '../parseWithPointers';

const users = fs.readFileSync(join(__dirname, './fixtures/users.json'), 'utf-8');
// const multilineComments = fs.readFileSync(join(__dirname, './fixtures/multiline-comments.json'), 'utf-8');
// const petStore = fs.readFileSync(join(__dirname, './fixtures/petstore.oas2.json'), 'utf-8');

describe('json patches', () => {
  describe('remove patch', () => {
    describe('users fixture', () => {
      test.each`
        file                        | path
        ${'users/single-user.json'} | ${['users', 0]}
        ${'users/no-users.json'}    | ${['users']}
        ${'users/no-city.json'}     | ${['users', 0, 'address', 'city']}
      `('should match file $file and path $path', ({ file, path }) => {
        const content = fs.readFileSync(join(__dirname, './fixtures/', file), 'utf-8');
        const result = parseWithPointers(users);

        applyJsonPatch(result, {
          type: PatchTypes.Remove,
          path,
        });

        expect(parseWithPointers(users)).toMatchSnapshot();
        expect(result).toEqual(parseWithPointers(content));
      });
    });
  });
});
