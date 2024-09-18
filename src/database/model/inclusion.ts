type LeftoverKeys<A extends string[], B extends string[]> = readonly Exclude<
  A[number],
  B[number]
>[];

export type ConditionallyInclude<
  T,
  F extends (keyof T & string)[],
  I extends F[number][],
> = I extends F[number][] ? Omit<T, LeftoverKeys<F, I>[number]> : never;

export const fieldIsIncluded = <I extends string[] | []>(
  field: string | string[],
  includes: I | undefined,
): boolean => {
  if (includes === undefined) {
    return false;
  } else if (includes.length === 0) {
    return false;
  } else if (Array.isArray(field)) {
    return field.map(f => fieldIsIncluded(f, includes)).every(Boolean);
  }
  return (includes as string[]).includes(field);
};

type RemoveFirst<T extends string[]> = T extends [string, ...infer U extends string[]] ? U : never;

export type InclusionSubset<I extends string[], K extends I[number]> = K extends string
  ? I extends []
    ? never
    : I extends [K]
      ? [K]
      : I extends [...infer T extends [T[number], ...T[number][]], infer S extends K]
        ? [...T, S]
        : I extends [infer S extends K, ...infer T extends [T[number], ...T[number][]]]
          ? [S, ...T]
          : [I[0]] extends ["skills"]
            ? [I[0], ...InclusionSubset<RemoveFirst<I>, K>]
            : InclusionSubset<RemoveFirst<I>, K>
  : never;
