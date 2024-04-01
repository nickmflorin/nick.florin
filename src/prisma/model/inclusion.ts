import { type Prettify } from "~/lib/types";

export type Includes<F extends string = string> = Partial<{ [key in F]: boolean }>;

export type IncludeAll<I extends Includes> = { [key in keyof I]-?: true };

export type ConditionallyExcluded<
  F extends readonly string[],
  O extends Record<F[number], unknown>,
  I extends Partial<{ [key in F[number]]: boolean }>,
> = {
  [key in keyof O as key extends F[number] ? (I[key] extends true ? key : never) : key]: O[key];
};

export const conditionallyExclude = <
  F extends readonly string[],
  O extends Record<F[number], unknown>,
  I extends Partial<{ [key in F[number]]: boolean }>,
>(
  obj: O,
  fields: F,
  includes: I,
): ConditionallyExcluded<F, O, I> => {
  const modified = { ...obj };
  for (const field of fields) {
    const f = field as F[number];
    if (includes[f] === false || includes[f] === undefined) {
      delete modified[f];
    }
  }
  return modified;
};

export type ConditionallyIncluded<
  O extends Record<string, unknown>,
  D extends Record<string, unknown>,
  I extends Partial<{ [key in keyof D]: boolean }>,
> = Prettify<
  {
    [key in Exclude<keyof O, keyof D>]: O[key];
  } & {
    [key in keyof D as I[key] extends true ? key : never]: D[key];
  }
>;

export const conditionallyInclude = <
  O extends Record<string, unknown>,
  D extends Record<string, unknown>,
  I extends Partial<{ [key in keyof D]: boolean }>,
>(
  obj: O,
  data: D,
  includes: I,
): ConditionallyIncluded<O, D, I> => {
  let modified = { ...obj };
  for (const k of Object.keys(data) as (keyof D)[]) {
    if (obj[k as keyof O] !== undefined) {
      throw new Error(`Key ${String(k)} already exists in the object.`);
    }
    if (includes[k] === true) {
      modified = { ...modified, [k]: data[k] };
    }
  }
  return modified as ConditionallyIncluded<O, D, I>;
};
