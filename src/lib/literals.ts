import difference from "lodash.difference";
import intesection from "lodash.intersection";

import type * as types from "./types";

import { humanizeList } from "./formatters";

export type LiteralsAccessor<V> = V extends string
  ? types.SpacesToUnderscores<types.HyphensToUnderscores<Uppercase<V>>>
  : never;

export type EnumeratedLiteralsAccessors<V extends readonly unknown[]> = {
  [key in keyof V as key extends string ? LiteralsAccessor<V[key]> : never]: V[key];
};

type EnumeratedLiteralsAssertion<V extends readonly unknown[]> = (
  value: unknown,
) => asserts value is V[number];

/**
 * A generic type that results in a type referred to internally as a set of "EnumeratedLiterals",
 * which is formed from the strings defined in the read-only array type defined by the generic type
 * parameter {@link V}.
 *
 * Generally, a set of {@link EnumeratedLiterals} is defined as an object that is used to represent
 * the discrete, literal {@link string} values that a given variable can exhibit, by providing both
 * properties to access the discrete values themselves and a property to access an {@link Array} of
 * all possible discrete values.
 *
 * This type should be used when defining discrete values that a variable can exhibit.
 *
 * Usage
 * -----
 * Assume that we have a variable Permission that can take on values "admin", "dev" or "user".  The
 * {@link EnumeratedLiterals} of those values can be represented as:
 *
 *   EnumeratedLiterals<readonly ["admin", "dev", "user"]>
 *
 * Which will look as follows:
 *
 *   { ADMIN: "admin", DEV: "dev", USER: "user", __ALL__: readonly ["admin", "dev", "user"] }
 */
export type EnumeratedLiterals<V extends readonly unknown[]> = EnumeratedLiteralsAccessors<V> & {
  readonly values: V;
  /**
   * A method that returns the unknown value after an assertion has been applied guaranteeing that
   * the provided value is in the set of constants defined by the enumerated literals instance,
   * {@link EnumeratedLiteral}.
   *
   * @example
   * const ValidSizes = enumeratedLiterals(["small", "medium", "large"] as const);
   * type ValidSize = EnumeratedLiteralType<typeof ValidSizes>;
   *
   * const MyComponent = ({ size, ...props }: { size: ValidSize, ... }): JSX.Element => {
   *   return <></>
   * }
   *
   * const ParentComponent = ({ size, ...props }: { size: string, ... }): JSX.Element => {
   *   // The `size` prop is now type-safe because if it is not a valid size, an error will be
   *   // thrown.
   *   return <MyComponent {...props} size={ValidSizes.parse(size)} />
   * }
   */
  readonly parse: (v: unknown) => V[number];
  readonly assert: EnumeratedLiteralsAssertion<V>;
  /**
   * A type guard that returns whether or not the provided value is in the set of constants included
   * in the literals, {@link EnumeratedLiterals} and is thus of the type
   * {@link EnumeratedLiteralType} that associated with the set of literals.
   *
   * @example
   * const ValidSizes = enumeratedLiterals(["small", "medium", "large"] as const);
   * type ValidSize = EnumeratedLiteralType<typeof ValidSizes>;
   *
   * const MyComponent = ({ size, ...props }: { size: ValidSize, ... }): JSX.Element => {
   *   return <></>
   * }
   *
   * const ParentComponent = ({ size, ...props }: { size: string, ... }): JSX.Element => {
   *   if (ValidSizes.contains(size)) {
   *     // The `size` prop is now type-safe and guaranteed to be of type ValidSize.
   *     return <MyComponent {...props} size={size} />
   *   }
   *   return <></>
   * }
   */
  readonly contains: (v: unknown) => v is V[number];
  /**
   * Returns a new enumerated literals instance, {@link EnumeratedLiterals}, that is formed from
   * a provided subset of the constants associated with the original enumerated literals instance,
   * {@link EnumeratedLiterals}.
   *
   * @example
   * const Constants = enumeratedLiterals(["a", "b"] as const);
   * // EnumeratedLiterals<readonly ["a"]>;
   * const NewConstants = Constants.pick(["a", "d"] as const);
   */
  readonly pick: <T extends readonly string[]>(
    vs: T,
  ) => EnumeratedLiterals<types.ExtractFromReadonlyArray<V, T>>;
  /**
   * Returns a new enumerated literals instance, {@link EnumeratedLiterals}, that is formed from
   * a the constants associated with the original enumerated literals instance,
   * {@link EnumeratedLiterals}, excluding the constants provided as a readonly array to the method,
   * {@link T}.
   *
   * @example
   * const Constants = enumeratedLiterals(["a", "b"] as const);
   * // EnumeratedLiterals<readonly ["a"]>;
   * const NewConstants = Constants.omit(["b"] as const);
   */
  readonly omit: <T extends readonly string[]>(
    vs: T,
  ) => EnumeratedLiterals<types.ExcludeFromReadonlyArray<V, T>>;
  readonly throwInvalidValue: (v: unknown) => void;
};

/**
 * A generic type that results in the type that was used to construct the {@link EnumeratedLiterals}
 * defined by the generic type parameter, {@link O}.
 */
export type EnumeratedLiteralType<O> = O extends EnumeratedLiterals<infer V> ? V[number] : never;

export const toLiteralAccessor = <V extends string = string>(v: V): LiteralsAccessor<V> =>
  v.toUpperCase().replaceAll("-", "_").replaceAll(" ", "_") as LiteralsAccessor<V>;

/**
 * A generic type that results in a type referred to internally as an "EnumeratedLiteralMap", which
 * is formed from the strings defined in the read-only array type defined by the generic type
 * parameter {@link V}.
 *
 * Generally, an {@link EnumeratedLiterals} is defined as an object that is used to represent the
 * discrete, literal {@link string} values that a given variable can exhibit, by providing both
 * properties to access the discrete values themselves and a property to access an {@link Array} of
 * all possible discrete values.
 *
 * This type should be used when defining discrete values that a variable can exhibit, as it defines
 * both accessors for those constants and an accessor for all possible options.
 *
 * @example
 * const Permissions = enumeratedLiterals(["admin", "dev", "user"] as const)
 * Permissions.ADMIN // "admin"
 * Permissions.__ALL__ // ["admin", "dev", "user"]
 *
 * @param {types.UniqueArray<V>} data
 *   A read-only array of values that the variable is allowed to exhibit.
 *
 * @returns {@link EnumeratedLiterals<V>}
 */
export const enumeratedLiterals = <V extends readonly string[]>(
  values: V,
): EnumeratedLiterals<V> => {
  let seen: [string, string][] = [];

  const accessors: EnumeratedLiteralsAccessors<V> = values.reduce<EnumeratedLiteralsAccessors<V>>(
    (acc, curr) => {
      const accessor = toLiteralAccessor(curr);
      const ind = seen.findIndex(([a]) => a === accessor);
      if (ind !== -1) {
        if (seen[ind][0] === curr) {
          throw new Error(`Encountered duplicate keys '${curr}'!  The keys must be unique.`);
        }
        throw new Error(
          `Encountered two keys, '${seen[ind][0]}' and '${curr}', that map to the same ` +
            `accessor, '${accessor}'!  The keys must map to unique accessors.`,
        );
      }
      seen = [...seen, [curr, accessor]];
      return { ...acc, [accessor]: curr };
    },
    {} as EnumeratedLiteralsAccessors<V>,
  );

  return {
    ...accessors,
    values,
    throwInvalidValue(this: EnumeratedLiterals<V>, v: unknown, message?: string) {
      const humanizedValues = humanizeList([...this.values], { conjunction: "or" });
      throw new Error(
        message ||
          `The value ${JSON.stringify(v)} is not valid, it must be one of ${humanizedValues}.`,
      );
    },
    contains(this: EnumeratedLiterals<V>, v: unknown): v is V[number] {
      return typeof v === "string" && this.values.includes(v);
    },
    parse(this: EnumeratedLiterals<V>, v: unknown): V[number] {
      this.assert(v);
      return v;
    },
    assert(this: EnumeratedLiterals<V>, v: unknown) {
      if (!this.contains(v)) {
        this.throwInvalidValue(v);
      }
    },
    pick<T extends readonly string[]>(this: EnumeratedLiterals<V>, vs: T) {
      return enumeratedLiterals(
        intesection([...this.values], [...vs]) as types.ExtractFromReadonlyArray<V, T>,
      );
    },
    omit<T extends readonly string[]>(this: EnumeratedLiterals<V>, vs: T) {
      return enumeratedLiterals(
        difference([...this.values], [...vs]) as types.ExcludeFromReadonlyArray<V, T>,
      );
    },
  };
};
