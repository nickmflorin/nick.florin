import { humanizeList } from "~/lib/formatters/humanize-list";

type RemoveLeadingHyphens<S extends string> = S extends `-${infer R extends string}`
  ? RemoveLeadingHyphens<R>
  : S;

type RemoveTrailingHyphens<S extends string> = S extends `${infer R extends string}-`
  ? RemoveTrailingHyphens<R>
  : S;

type JoinOnHyphen<
  A extends string,
  B extends string,
> = `${RemoveTrailingHyphens<A>}-${RemoveLeadingHyphens<B>}`;

type PrefixWithHyphen<S extends string> = `-${RemoveLeadingHyphens<S>}`;

const AlphaChars = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
] as const;
type _AlphaChar = (typeof AlphaChars)[number];

type AlphaChar = _AlphaChar | Uppercase<_AlphaChar>;
type HypenAlphaChar = AlphaChar | "-" | " ";

type IsHyphenableChar<S extends string> = S extends ""
  ? true
  : S extends `${HypenAlphaChar}${infer R}`
    ? IsHyphenableChar<R>
    : false;

const isAlphaChar = (char: string): char is AlphaChar => {
  if (char.length !== 1) {
    throw new Error(
      "Cannot determine whether or not a multi-character length string is an alpha character!",
    );
  }
  return AlphaChars.includes(char.toLowerCase() as _AlphaChar);
};

const isHyphenableChar = (char: string): char is HypenAlphaChar =>
  char === "-" || char === " " || isAlphaChar(char);

export type HyphenCase<
  S extends string,
  __RECURSION__ extends boolean = false,
> = S extends `${infer First} ${infer Rest}`
  ? HyphenCase<JoinOnHyphen<First, Rest>>
  : S extends `${infer First}-${infer Rest}`
    ? `${HyphenCase<First>}-${HyphenCase<Rest>}`
    : S extends `${infer First}${infer Rest}`
      ? First extends Lowercase<First>
        ? `${First}${HyphenCase<Rest, true>}`
        : __RECURSION__ extends true
          ? `${PrefixWithHyphen<Lowercase<First>>}${HyphenCase<RemoveLeadingHyphens<Rest>, true>}`
          : HyphenCase<`${Lowercase<First>}${HyphenCase<Rest>}`, true>
      : S;

type ToHyphenCase<S extends string> = IsHyphenableChar<S> extends false ? never : HyphenCase<S>;

export const toHyphenCase = <S extends string>(v: S): ToHyphenCase<S> => {
  /* Determine if there are any non-alpha, non-space or non-hyphen characters in the string.  If
     there are, we need to throw an error indicating that the string is an invalid candidate for
     converting to hyphen-case. */
  const invalidChars = v.split("").filter(char => !isHyphenableChar(char));
  if (invalidChars.length !== 0) {
    const humanized = humanizeList(invalidChars, { formatter: v => `'${v}'`, conjunction: "and" });
    throw new TypeError(
      `Encountered invalid character(s): ${humanized}.  In order for a string to be converted ` +
        "to hyphen-case, it must only contain letters, hyphens, and spaces.",
    );
  }
  /* Remove all leading non-alpha characters up until the first alpha character, and all trailing
     non-alpha characters up until the last alpha character, keeping both series of characters in
     memory so they can be added back to the beginning and end of the final result, respectively. */
  let leadingNonAlphaChars = "";
  let trailingNonAlphaChars = "";

  /* Make sure to check if the running value is not an empty string before applying the alpha
     character typeguard.  If the running value is an empty string, then the charAt(0) method
     will return a string of length 0, which will cause the typeguard to fail. */
  while (v.length > 0 && !isAlphaChar(v.charAt(0))) {
    /* Whitespace characters are removed from the leading and trailing non-alpha character
       sequences.  This is because if a white-space occurs in the middle of the string, it is
       converted to a hyphen - but if it occurs as a leading or trailing character, it can only
       be surrounded by spaces or hyphens (since these are the only two valid hyphenable
       non-alpha characters).  We want to ensure that hyphens separated by spaces at the beginning
       and end of the alpha character sequence are removed so it does not result in double
       hyphens. */
    if (v.charAt(0) !== " ") {
      leadingNonAlphaChars += v.charAt(0);
    }
    v = v.slice(1) as S;
  }

  /* Make sure to check if the running value is not an empty string before applying the alpha
     character typeguard.  If the running value is an empty string, then the charAt(0) method
     will return a string of length 0, which will cause the typeguard to fail. */
  while (v.length > 0 && !isAlphaChar(v.charAt(v.length - 1))) {
    // See comment above in previous while loop for explanation of why whitespace is removed.
    if (v.charAt(v.length - 1) !== " ") {
      trailingNonAlphaChars += v.charAt(v.length - 1);
    }
    v = v.slice(0, -1) as S;
  }

  const firstChar = v.charAt(0);
  // This will be the case if there are no alpha characters in the string.
  if (firstChar.length === 0) {
    return (leadingNonAlphaChars + trailingNonAlphaChars) as ToHyphenCase<S>;
  } else if (!isAlphaChar(firstChar)) {
    throw new Error(
      `At this point in the logic, the first character should be guaranteed to be an " +
        "alpha character, but it is not - it is '${firstChar}'.`,
    );
  }
  if (firstChar.toUpperCase() === firstChar) {
    v = `${firstChar.toLowerCase()}${v.slice(1)}` as S;
  }
  return (leadingNonAlphaChars +
    v
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase()
      .replaceAll(" ", "-") +
    trailingNonAlphaChars) as ToHyphenCase<S>;
};
