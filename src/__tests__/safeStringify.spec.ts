import { describe, expect, it } from 'vitest';

import { safeStringify } from '../safeStringify';
import * as jsonFixtures from './fixtures/json';

const Benchmark = require('benchmark');

describe('safeStringify', () => {
  it.skip('benchmark', async () => {
    const suite = new Benchmark.Suite();

    await new Promise<void>(resolve => {
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
          // eslint-disable-next-line no-console
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
    expect(safeStringify([0, 1])).toEqual('[0,1]');
  });

  it('should not serialize undefined', () => {
    expect(safeStringify(undefined)).toBeUndefined();
  });

  it('should handle falsy values correctly', () => {
    expect(safeStringify(null)).toBe('null');
    expect(safeStringify(0)).toBe('0');
    expect(safeStringify(-0)).toBe('0');
    expect(safeStringify(NaN)).toBe('null');
    expect(safeStringify(false)).toBe('false');
    expect(safeStringify({ value: undefined })).toBe('{}');
  });

  it('should not stringify something that is already a string', () => {
    // invalid json (for example coming from user in code editor) SHOULD not stringify again
    expect(safeStringify('{"foo": "bar",}')).toBe('{"foo": "bar",}');
    expect(safeStringify(JSON.stringify({ foo: 'bar' }))).toBe(JSON.stringify({ foo: 'bar' }));
  });
});
