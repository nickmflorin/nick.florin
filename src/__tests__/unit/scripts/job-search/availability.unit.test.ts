import {
  formatStartDate,
  startDate,
  startPhrase,
} from '~/scripts/job-search/applying/availability';

const Now = new Date('2026-10-05T12:00:00');

describe('startDate()', () => {
  it.each([
    ['immediately', '10/05/2026'],
    ['2 weeks', '10/19/2026'],
    ['1 month', '11/05/2026'],
    ['2026-12-01', '12/01/2026'],
  ] as const)('works %j out to %s', (start, date) => {
    expect(formatStartDate(startDate(start, Now), false)).toBe(date);
  });
});

describe('startPhrase()', () => {
  it.each([
    ['immediately', 'Immediately'],
    ['2 weeks', 'In 2 weeks'],
    ['2026-12-01', 'December 1, 2026'],
  ] as const)('words %j as %j', (start, phrase) => {
    expect(startPhrase(start)).toBe(phrase);
  });
});
