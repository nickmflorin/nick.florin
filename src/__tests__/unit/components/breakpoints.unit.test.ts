import {
  type Breakpoint,
  Breakpoints,
  type ScreenSize,
  screenSizeIsInRange,
  type ScreenSizeRange,
  sizeToString,
} from '~/components/types';

type RootCase = [Breakpoint, ScreenSizeRange, boolean];
type Case = [ScreenSize, ScreenSizeRange, boolean];

const XsPixels = sizeToString(Breakpoints.getModel('xs').size, 'px');
const SmPixels = sizeToString(Breakpoints.getModel('sm').size, 'px');
const LgPixels = sizeToString(Breakpoints.getModel('lg').size, 'px');

const RootCases: RootCase[] = [
  ['md', 'sm:lg', true],
  ['sm', 'sm:lg', true],
  ['xs', 'sm:lg', false],
  ['lg', 'sm:lg', false],
  ['lg', 'sm:inf', true],
  ['xs', '0:lg', true],
  ['md', `${XsPixels}:${SmPixels}`, false],
  ['md', `${SmPixels}:${LgPixels}`, true],
  ['lg', `${SmPixels}:${LgPixels}`, false],
  ['md', `${Breakpoints.getModel('xs').size}:${Breakpoints.getModel('sm').size}`, false],
  ['md', `${Breakpoints.getModel('sm').size}:${Breakpoints.getModel('lg').size}`, true],
  ['lg', `${Breakpoints.getModel('sm').size}:${Breakpoints.getModel('lg').size}`, false],
];

describe('screenSizeIsInRange()', () => {
  const CASES: Case[] = RootCases.reduce(
    (prev: Case[], curr: RootCase) => [
      ...prev,
      curr,
      [Breakpoints.getModel(curr[0]).size, curr[1], curr[2]] as Case,
      [sizeToString(Breakpoints.getModel(curr[0]).size, 'px'), curr[1], curr[2]] as Case,
    ],
    [] as Case[],
  );

  it.each(CASES)('(size = %s, range = %s)', (size, range, expected) => {
    expect(screenSizeIsInRange(size, range)).toBe(expected);
  });
});
