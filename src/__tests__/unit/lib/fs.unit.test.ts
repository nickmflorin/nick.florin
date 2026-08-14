import { type FileSizeUnit, getFileSize, toFileSizeString } from '~/lib/fs';

const Kilobyte = 1024;
const Megabyte = 1024 ** 2;
const Gigabyte = 1024 ** 3;
const Terabyte = 1024 ** 4;
const Petabyte = 1024 ** 5;

type Case = [number, FileSizeUnit, number];

const Cases: Case[] = [
  [0, 'b', 0],
  [512, 'b', 512],
  [Kilobyte - 1, 'b', 1023],
  /* The exact powers of 1024 are the boundaries the unit scan has to claim rather than fall
     through, because a file whose size is exactly one megabyte is not measured in petabytes. */
  [Kilobyte, 'kb', 1],
  [Kilobyte * 2.5, 'kb', 2.5],
  [Megabyte, 'mb', 1],
  [Megabyte * 3, 'mb', 3],
  [Gigabyte, 'gb', 1],
  [Terabyte, 'tb', 1],
  [Petabyte, 'pb', 1],
  [Petabyte * 4, 'pb', 4],
];

describe('getFileSize()', () => {
  it.each(Cases)('(value = %s)', (value, unit, size) => {
    expect(getFileSize(value)).toStrictEqual([unit, size]);
  });

  it('measures a bigint the same way it measures a number', () => {
    expect(getFileSize(BigInt(Megabyte * 2))).toStrictEqual(['mb', 2]);
  });
});

describe('toFileSizeString()', () => {
  it('renders the size to two decimal places with an uppercase unit', () => {
    expect(toFileSizeString(Megabyte * 1.5)).toBe('1.50 MB');
  });

  it('renders a sub-kilobyte size in bytes', () => {
    expect(toFileSizeString(940)).toBe('940.00 B');
  });

  it('renders an exact unit boundary as one of that unit', () => {
    expect(toFileSizeString(Gigabyte)).toBe('1.00 GB');
  });
});
