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
    expect(safeStringify([0, 1])).toEqual('[0,1]');
  });

  it('should not serialize undefined, symbols and functions', () => {
    expect(safeStringify(Symbol('d'))).toBeUndefined();
    expect(safeStringify(Function)).toBeUndefined();
    expect(safeStringify(undefined)).toBeUndefined();
  });

  it('should cover toJSON', () => {
    expect(safeStringify({ toJSON: () => 2 })).toEqual('2');
    expect(safeStringify({ toJSON: () => null })).toEqual('null');
    expect(safeStringify({ toJSON: () => undefined })).toBeUndefined();
    expect(
      safeStringify({
        toJSON: () => {
          /* nada */
        },
      }),
    ).toBeUndefined();
    expect(safeStringify({ toJSON: () => Symbol('d') })).toBeUndefined();
    expect(safeStringify({ toJSON: () => Function })).toBeUndefined();
    expect(
      safeStringify({
        a: undefined,
        toJSON() {
          return this.a;
        },
      }),
    ).toBeUndefined();
    expect(
      safeStringify({
        toJSON() {
          if (Function('return Math.random() > 1')()) {
            return 2;
          }

          return;
        },
      }),
    ).toBeUndefined();
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
