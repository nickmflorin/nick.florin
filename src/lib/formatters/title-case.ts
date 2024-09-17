export type TitleCase<S extends string> = S extends `${infer A}-${infer B}`
  ? `${TitleCase<A>}-${TitleCase<B>}`
  : S extends `${infer A} ${infer B}`
    ? `${TitleCase<A>} ${TitleCase<B>}`
    : Capitalize<Lowercase<S>>;

export const titleCase = <T extends string>(value: T): TitleCase<T> =>
  value.toLowerCase().replace(/(?:^|[\s-/])\w/g, match => match.toUpperCase()) as TitleCase<T>;
