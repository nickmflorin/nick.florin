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

/**
 * Asserts that the provided value has been narrowed to `never`, which is only the case when every
 * member of the finite type it originated from has already been handled.
 *
 * Calling this in the `default` clause of a `switch` over a union or enum turns exhaustiveness into
 * a compile-time guarantee. When a member is later added to that union, the value reaching the
 * `default` clause is no longer `never`, and the call fails to compile at every site that does not
 * handle the new member.
 *
 * The `never` return type also satisfies the return type of the enclosing function, so no
 * placeholder value has to be invented for a branch that cannot be reached.
 *
 * @param {never} value
 *   The value that the preceding branches should have narrowed to `never`.
 *
 * @throws {TypeError}
 *   Always. Reaching the call at runtime means a value outside the declared type was encountered,
 *   which the type system was told could not happen.
 */
export const assertNever = (value: never): never => {
  throw new TypeError(
    `Unexpectedly encountered the value '${String(value)}' in a branch that should be unreachable!`,
  );
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
