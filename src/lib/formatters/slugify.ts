import { humanizeList } from "./humanize-list";

const VALID_NON_ALPHA_NUMERICS = [
  "@",
  "&",
  "~",
  "!",
  "~",
  "#",
  "$",
  "%",
  "^",
  "*",
  "(",
  ")",
  "+",
  "=",
  "[",
  "]",
  "{",
  "}",
  "|",
  ":",
  ";",
  "<",
  ">",
  ",",
  ".",
  "?",
  "/",
] as const;

const ALPHA_NUMERICS = [
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
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
] as const;

type AlphaNumeric = (typeof ALPHA_NUMERICS)[number];
type ValidNonAlphaNumeric = (typeof VALID_NON_ALPHA_NUMERICS)[number];

type ReplaceNonAlphaNumerics<S extends string, N extends string = ""> = S extends ""
  ? N
  : S extends `${infer A extends string}${infer R extends string}`
    ? A extends AlphaNumeric
      ? ReplaceNonAlphaNumerics<R, `${N}${A}`>
      : A extends ValidNonAlphaNumeric
        ? ReplaceNonAlphaNumerics<R, `${N} `>
        : ReplaceNonAlphaNumerics<R, `${N}${A} `>
    : N;

type Trim<S extends string> = S extends ` ${infer R extends string} `
  ? Trim<R>
  : S extends ` ${infer R extends string}`
    ? Trim<R>
    : S extends `${infer R extends string} `
      ? Trim<R>
      : S;

type RemoveExtraSpaces<T extends string> = T extends `${infer LEFT extends
  string}  ${infer RIGHT extends string}`
  ? RemoveExtraSpaces<`${LEFT} ${RIGHT}`>
  : Trim<T>;

type ReplaceSpacesWithDash<T extends string> = T extends `${infer V extends
  string} ${infer L extends string}`
  ? ReplaceSpacesWithDash<`${V}-${L}`>
  : T;

type Slug<T extends string> = ReplaceSpacesWithDash<
  RemoveExtraSpaces<ReplaceNonAlphaNumerics<Lowercase<T>>>
>;

const removeExtraWhiteSpace = <T extends string>(value: T): RemoveExtraSpaces<T> => {
  let newValue = value.trim();
  while (newValue.includes("  ")) {
    newValue = newValue.replaceAll("  ", " ");
  }
  return newValue as RemoveExtraSpaces<T>;
};

export const slugify = <T extends string>(s: T): Slug<T> => {
  let runningString = "";

  const invalidChars: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const char = s[i].toLowerCase();
    if (ALPHA_NUMERICS.includes(char as AlphaNumeric) || char === "-") {
      runningString += char;
    } else if (VALID_NON_ALPHA_NUMERICS.includes(char as ValidNonAlphaNumeric) || char === " ") {
      runningString += " ";
    } else {
      invalidChars.push(char);
    }
  }
  if (invalidChars.length > 0) {
    const charString = humanizeList(invalidChars, { conjunction: "and", formatter: v => `'${v}'` });
    throw new Error(
      `The string '${s}' cannot be slugified, it contains the following invalid character(s): ${charString}.`,
    );
  }
  return removeExtraWhiteSpace(runningString).replaceAll(" ", "-") as Slug<T>;
};
