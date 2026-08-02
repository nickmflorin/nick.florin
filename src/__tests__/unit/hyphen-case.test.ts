import { toHyphenCase } from '~/lib/formatters';

type Case = [string, string];

const Cases: Case[] = [
  ['fooBarBanana', 'foo-bar-banana'],
  ['FooBarBanana', 'foo-bar-banana'],
  [' fooBarBanana ', 'foo-bar-banana'],
  ['foo-barBanana', 'foo-bar-banana'],
  ['foo bar Banana', 'foo-bar-banana'],
  ['-fooBar-Banana', '-foo-bar-banana'],
  [' -fooBar-Banana', '-foo-bar-banana'],
  ['-  fooBar Banana bat', '-foo-bar-banana-bat'],
  [' -fooBar-Banana -  ', '-foo-bar-banana-'],
  ['-  fooBar Banana bat  - ', '-foo-bar-banana-bat-'],
  [' - ', '-'],
  [' ', ''],
  ['', ''],
];

const ErrorCases: [string][] = [['foo9BarBanana']];

describe('toHyphenCase()', () => {
  it.each(Cases)('(input = %s)', (input, expected) => {
    expect(toHyphenCase(input)).toBe(expected);
  });

  it.each(ErrorCases)('throws a TypeError (input = %s)', input => {
    expect(() => toHyphenCase(input)).toThrow(TypeError);
  });
});
