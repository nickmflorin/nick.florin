import { z } from 'zod';

type AssertDefined = <V>(value: undefined | V) => asserts value is V;

export const assertDefined: AssertDefined = <V>(value: undefined | V): asserts value is V => {
  if (value === undefined) {
    throw new TypeError('Unexpectedly encountered undefined value!');
  }
};

export const ensuresDefinedValue = <V>(value: undefined | V): V => {
  assertDefined(value);
  return value;
};

declare const uuidBrand: unique symbol;

/**
 * A `string` that has been validated as a UUID by {@link isUuid}.
 *
 * The brand makes {@link Uuid} a strict subtype of `string` rather than an alias for it. This
 * matters because {@link isUuid} validates the format of a value, not its type: if the guard
 * narrowed to `string`, then narrowing a value that is already a `string` would leave `never` in
 * the guard's negative branch, and the invalid values that branch exists to report would no longer
 * be usable as strings.
 */
export type Uuid = { readonly [uuidBrand]: true } & string;

export const isUuid = (value: unknown): value is Uuid => z.string().uuid().safeParse(value).success;

export const isRecordType = (value: unknown): value is Record<string, unknown> =>
  z.record(z.any()).safeParse(value).success;
