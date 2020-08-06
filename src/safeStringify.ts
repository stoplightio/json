import { Optional } from '@stoplight/types';
// NOTE: There are many safe stringify implementations. This one has proven to handle the most edge cases.
// Be very careful if considering switching out the underlying library to a different one!
import fastStringify from 'safe-stable-stringify';

type Replacer = (key: string, value: any) => any | Array<number | string> | null;

type Voidable =
  | undefined
  | Function
  | symbol
  | { [key: string]: any; [key: number]: any; toJSON(): undefined | Function | symbol };

type Serializable = string | boolean | number | object | null;

type NotBigInt<T> = T extends bigint ? never : T;

export function safeStringify(value: Voidable, replacer?: Replacer, space?: string | number): undefined;
export function safeStringify(value: Serializable, replacer?: Replacer, space?: string | number): string;
export function safeStringify(
  value: NotBigInt<unknown>,
  replacer?: Replacer,
  space?: string | number,
): Optional<string> {
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
