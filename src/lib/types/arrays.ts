/**
 * A generic type that will result in a readonly array, {@link readonly []}, that is formed from
 * the values present in the readonly array corresponding to the first generic type argument but
 * not present in the readonly array corresponding to the second generic type argument, {@link I}.
 *
 * @example
 * type V = readonly ["a", "b", "c"];
 * ExcludeFromReadonlyArray<V, readonly ["b", "d"]>; // readonly ["a", "c"];
 */
export type ExcludeFromReadonlyArray<A extends readonly unknown[], I> = A extends readonly []
  ? readonly []
  : A extends readonly [infer H, ...infer R]
    ? H extends I
      ? ExcludeFromReadonlyArray<R, I>
      : readonly [H, ...ExcludeFromReadonlyArray<R, I>]
    : A;

/**
 * A generic type that will result in a readonly array, {@link readonly []}, that is formed from
 * the values that are present in both the readonly array corresponding to the first generic type
 * argument, {@link A}, and the values present in the second generic type argument, {@link I}.
 *
 * @example
 * type V = readonly ["a", "b", "c"];
 * ExtractFromReadonlyArray<V, readonly ["b", "d"]>; // readonly ["b"];
 */
export type ExtractFromReadonlyArray<
  A extends readonly unknown[],
  I extends readonly unknown[],
> = A extends readonly []
  ? readonly []
  : A extends readonly [infer H, ...infer R]
    ? H extends I[number]
      ? readonly [H, ...ExtractFromReadonlyArray<R, I>]
      : ExtractFromReadonlyArray<R, I>
    : A;
