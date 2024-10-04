import {
  screenSizeIsInRange,
  Breakpoints,
  sizeToString,
  type ScreenSize,
  type ScreenSizeRange,
  type Breakpoint,
} from "~/components/types";

type RootCase = [Breakpoint, ScreenSizeRange, boolean];
type Case = [ScreenSize, ScreenSizeRange, boolean];

const RootCases: RootCase[] = [
  ["md", "sm:lg", true],
  ["sm", "sm:lg", true],
  ["xs", "sm:lg", false],
  ["lg", "sm:lg", false],
  ["lg", "sm:inf", true],
  ["xs", "0:lg", true],
  [
    "md",
    `${sizeToString(Breakpoints.getModel("xs").size, "px")}:${sizeToString(Breakpoints.getModel("sm").size, "px")}`,
    false,
  ],
  [
    "md",
    `${sizeToString(Breakpoints.getModel("sm").size, "px")}:${sizeToString(Breakpoints.getModel("lg").size, "px")}`,
    true,
  ],
  [
    "lg",
    `${sizeToString(Breakpoints.getModel("sm").size, "px")}:${sizeToString(Breakpoints.getModel("lg").size, "px")}`,
    false,
  ],
  ["md", `${Breakpoints.getModel("xs").size}:${Breakpoints.getModel("sm").size}`, false],
  ["md", `${Breakpoints.getModel("sm").size}:${Breakpoints.getModel("lg").size}`, true],
  ["lg", `${Breakpoints.getModel("sm").size}:${Breakpoints.getModel("lg").size}`, false],
];

describe("screnSizeIsInRange()", () => {
  const CASES: Case[] = RootCases.reduce(
    (prev: Case[], curr: RootCase) => [
      ...prev,
      curr,
      [Breakpoints.getModel(curr[0]).size, curr[1], curr[2]] as Case,
      [sizeToString(Breakpoints.getModel(curr[0]).size, "px"), curr[1], curr[2]] as Case,
    ],
    [] as Case[],
  );
  test.each(CASES)("(size = %s, range = %s)", (size, range, expected) => {
    expect(screenSizeIsInRange(size, range)).toBe(expected);
  });
});
