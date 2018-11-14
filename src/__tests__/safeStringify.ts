/**
 * @jest-environment node
 */

import { safeStringify } from '../safeStringify';
import * as jsonFixtures from './fixtures/json';

const Benchmark = require('benchmark');

describe('safeStringify', () => {
  test.skip('benchmark', async () => {
    const suite = new Benchmark.Suite();

    await new Promise(resolve => {
      suite
        .add('native stringify small', () => {
          JSON.stringify(jsonFixtures.small);
        })
        .add('native stringify large', () => {
          JSON.stringify(jsonFixtures.large);
        })
        .add('custom stringify small', () => {
          safeStringify(jsonFixtures.small);
        })
        .add('custom stringify large', () => {
          safeStringify(jsonFixtures.large);
        })
        .add('custom stringify small circular', () => {
          safeStringify(jsonFixtures.smallCircular);
        })
        .add('custom stringify large circular', () => {
          safeStringify(jsonFixtures.largeCircular);
        })
        .on('cycle', (event: any) => {
          console.log(String(event.target));
        })
        .on('complete abort', () => {
          resolve();
        })
        .run();
    });
  });

  it('should work', () => {
    const val = { foo: true };
    expect(safeStringify(val)).toEqual('{"foo":true}');
    expect(safeStringify('{"foo":true}')).toEqual('{"foo":true}');
  });
});
