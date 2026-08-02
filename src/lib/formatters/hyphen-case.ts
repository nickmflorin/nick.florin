import { humanizeList } from '~/lib/formatters/humanize-list';

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
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
] as const;
type _AlphaChar = (typeof AlphaChars)[number];

type AlphaChar = _AlphaChar | Uppercase<_AlphaChar>;
type HyphenAlphaChar = ' ' | '-' | AlphaChar;

type IsHyphenableChar<S extends string> = S extends ''
  ? true
  : S extends `${HyphenAlphaChar}${infer R}`
    ? IsHyphenableChar<R>
    : false;

const isAlphaChar = (char: string): char is AlphaChar => {
  if (char.length !== 1) {
    throw new Error(
      'Cannot determine whether or not a multi-character length string is an alpha character!',
    );
  }
  return AlphaChars.includes(char.toLowerCase() as _AlphaChar);
};

const isHyphenableChar = (char: string): char is HyphenAlphaChar =>
  char === '-' || char === ' ' || isAlphaChar(char);

/**
 * Whether the character at the given index of a non-empty string is not an alpha character.
 *
 * The empty string is treated as not being at a non-alpha character so that this can safely guard
 * a loop that keeps stripping characters from a string until an alpha character is reached: passing
 * an empty string to {@link isAlphaChar} throws, since it only accepts single characters.
 */
const isNonEmptyNonAlphaCharAt = (str: string, index: number): boolean =>
  str.length > 0 && !isAlphaChar(str.charAt(index));

/**
 * Whether the given non-alpha character, found at the leading or trailing edge of a string being
 * stripped down to its innermost alpha characters, should be preserved in the resulting sequence of
 * leading or trailing non-alpha characters.
 *
 * A whitespace character that occurs in the middle of a string is converted to a hyphen elsewhere
 * in {@link toHyphenCase}, but at a leading or trailing position it can only be adjacent to another
 * space or hyphen, the only two valid hyphenable non-alpha characters. Excluding whitespace here
 * keeps a hyphen that is separated from the alpha sequence by a space from being duplicated into a
 * double hyphen.
 */
const shouldPreserveNonAlphaEdgeChar = (char: string): boolean => char !== ' ';

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
  const invalidChars = v.split('').filter(char => !isHyphenableChar(char));
  if (invalidChars.length !== 0) {
    const humanized = humanizeList(invalidChars, {
      conjunction: 'and',
      formatter: invalidChar => `'${invalidChar}'`,
    });
    throw new TypeError(
      `Encountered invalid character(s): ${humanized}.  In order for a string to be converted ` +
        'to hyphen-case, it must only contain letters, hyphens, and spaces.',
    );
  }
  let leadingNonAlphaChars = '';
  let trailingNonAlphaChars = '';
  /* Tracked separately from `v` so that the parameter itself is never reassigned. */
  let running: string = v;

  while (isNonEmptyNonAlphaCharAt(running, 0)) {
    if (shouldPreserveNonAlphaEdgeChar(running.charAt(0))) {
      leadingNonAlphaChars += running.charAt(0);
    }
    running = running.slice(1);
  }

  while (isNonEmptyNonAlphaCharAt(running, running.length - 1)) {
    if (shouldPreserveNonAlphaEdgeChar(running.charAt(running.length - 1))) {
      trailingNonAlphaChars += running.charAt(running.length - 1);
    }
    running = running.slice(0, -1);
  }

  const firstChar = running.charAt(0);
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
    running = `${firstChar.toLowerCase()}${running.slice(1)}`;
  }
  return (leadingNonAlphaChars +
    running
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replaceAll(' ', '-') +
    trailingNonAlphaChars) as ToHyphenCase<S>;
};
