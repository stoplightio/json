/**
 * @jest-environment node
 */

import { cloneDeep as _cloneDeep } from 'lodash';

import { decycle } from '../decycle';
import * as jsonFixtures from './fixtures/json';

const Benchmark = require('benchmark');

describe('decycle', () => {
  test.skip('benchmark', async () => {
    const suite = new Benchmark.Suite();

    await new Promise(resolve => {
      suite
        .add('decycle small', () => {
          decycle(jsonFixtures.small);
        })
        .add('decycle large', () => {
          decycle(jsonFixtures.large);
        })
        .add('decycle small circular', () => {
          decycle(_cloneDeep(jsonFixtures.smallCircular));
        })
        .add('decycle large circular', () => {
          decycle(_cloneDeep(jsonFixtures.largeCircular));
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
    const val: any = {
      hi: true,
    };
    val.inner = val;
    expect(decycle(val)).toEqual({ hi: true, inner: '[Circular]' });
  });
});
