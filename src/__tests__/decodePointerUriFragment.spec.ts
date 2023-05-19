import { decodePointerUriFragment } from '../decodePointerUriFragment';

test('decodePointerUriFragment', () => {
  expect(decodePointerUriFragment('#/foo%20%5E%20bar')).toEqual('#/foo ^ bar');
  expect(decodePointerUriFragment('#/users% ')).toEqual('#/users% ');
  expect(decodePointerUriFragment('#/users%%20%5E%')).toEqual('#/users% ^%');
});
