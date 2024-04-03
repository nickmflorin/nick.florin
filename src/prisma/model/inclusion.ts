type LeftoverKeys<A extends string[], B extends string[]> = readonly Exclude<
  A[number],
  B[number]
>[];

export type ConditionallyInclude<
  T,
  F extends (keyof T & string)[],
  I extends F[number][],
> = I extends F[number][] ? Omit<T, LeftoverKeys<F, I>[number]> : never;

export const conditionallyInclude = <T, F extends (keyof T & string)[], I extends F[number][]>(
  obj: T,
  fields: F,
  includes: I,
): ConditionallyInclude<T, F, I> => {
  const modified = { ...obj };
  for (const field of fields) {
    const f = field as F[number];
    if (includes.includes(f)) {
      delete modified[f];
    }
  }
  return modified as ConditionallyInclude<T, F, I>;
};

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
