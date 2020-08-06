import { Optional } from '@stoplight/types';
// NOTE: There are many safe stringify implementations. This one has proven to handle the most edge cases.
// Be very careful if considering switching out the underlying library to a different one!
import fastStringify from 'safe-stable-stringify';

type Replacer = (key: string, value: any) => any | Array<number | string> | null;

type Voidable = undefined | Function | symbol | void;
type Serializable = string | boolean | number | object | null;

export function safeStringify(value: Voidable, replacer?: Replacer, space?: string | number): undefined;
export function safeStringify<T extends object>(
  value: T,
  replacer?: Replacer,
  space?: string | number,
): T extends { toJSON(): infer R } ? (R extends Voidable ? undefined : string) : string;
export function safeStringify(value: Serializable, replacer?: Replacer, space?: string | number): string;
export function safeStringify(value: unknown, replacer?: Replacer, space?: string | number): Optional<string> {
  if (typeof value === 'string') {
    return value;
  }

  try {
    // try regular stringify first as mentioned in this tip:
    // https://github.com/davidmarkclements/fast-safe-stringify#protip
    return JSON.stringify(value, replacer, space);
  } catch {
    return fastStringify(value, replacer, space);
  }
}
