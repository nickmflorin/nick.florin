import { buildProfileDigest } from '~/scripts/job-search/profile/digest';
import { monthsCovered, monthsToYears } from '~/scripts/job-search/profile/experience';
import { loadCareerContent } from '~/scripts/job-search/profile/load';

const range = (start: string, end: string) => ({ end: new Date(end), start: new Date(start) });

describe('monthsCovered()', () => {
  it('counts the whole months a single range covers', () => {
    expect(monthsCovered([range('2020-01-01', '2021-01-01')])).toBe(12);
  });

  it('counts overlapping ranges once', () => {
    expect(
      monthsCovered([range('2020-01-01', '2021-01-01'), range('2020-07-01', '2021-07-01')]),
    ).toBe(18);
  });

  it('adds disjoint ranges, in any order', () => {
    expect(
      monthsCovered([range('2022-01-01', '2023-01-01'), range('2020-01-01', '2021-01-01')]),
    ).toBe(24);
  });

  it('counts nothing for no ranges', () => {
    expect(monthsCovered([])).toBe(0);
  });
});

describe('monthsToYears()', () => {
  it.each([
    [0, 0],
    [17, 1],
    [18, 2],
    [41, 3],
  ])('rounds %s months to %s years', (months, years) => {
    expect(monthsToYears(months)).toBe(years);
  });
});

describe('buildProfileDigest()', () => {
  it('summarizes the career fixtures, most recent and most experienced first', async () => {
    expect.hasAssertions();
    const digest = buildProfileDigest(await loadCareerContent(), new Date('2026-10-03'));
    expect(digest.roles.length).toBeGreaterThan(0);
    expect(digest.roles.map(({ start }) => start)).toStrictEqual(
      digest.roles.map(({ start }) => start).toSorted((a, b) => b.localeCompare(a)),
    );
    expect(Math.min(...digest.competencies.map(({ months }) => months))).toBeGreaterThanOrEqual(0);
    expect(Math.min(...digest.competencies.map(({ years }) => years))).toBeGreaterThanOrEqual(0);
    expect(digest.competencies.map(({ months }) => months)).toStrictEqual(
      digest.competencies.map(({ months }) => months).toSorted((a, b) => b - a),
    );
  });
});
