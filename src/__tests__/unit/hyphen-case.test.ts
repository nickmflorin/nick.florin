import { toHyphenCase } from "~/lib/formatters";

const ExpectError = { __error__: true } as const;
type ExpectError = typeof ExpectError;

type Case = [string, string | ExpectError];

const Cases: Case[] = [
  ["fooBarBanana", "foo-bar-banana"],
  ["FooBarBanana", "foo-bar-banana"],
  [" fooBarBanana ", "foo-bar-banana"],
  ["foo-barBanana", "foo-bar-banana"],
  ["foo9BarBanana", ExpectError],
  ["foo bar Banana", "foo-bar-banana"],
  ["-fooBar-Banana", "-foo-bar-banana"],
  [" -fooBar-Banana", "-foo-bar-banana"],
  ["-  fooBar Banana bat", "-foo-bar-banana-bat"],
  [" -fooBar-Banana -  ", "-foo-bar-banana-"],
  ["-  fooBar Banana bat  - ", "-foo-bar-banana-bat-"],
  [" - ", "-"],
  [" ", ""],
  ["", ""],
];

describe("toHyphenCase()", () => {
  test.each(Cases)("(input = %s)", (input, expected) => {
    if (typeof expected === "string") {
      expect(toHyphenCase(input)).toBe(expected);
    } else {
      expect(() => toHyphenCase(input)).toThrow(TypeError);
    }
  });
});
