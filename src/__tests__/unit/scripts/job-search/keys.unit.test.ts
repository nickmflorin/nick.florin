import { localDateKey, nextRunId } from '~/scripts/job-search/ledger/keys';

describe('localDateKey()', () => {
  it('formats the calendar date in the local time zone', () => {
    expect(localDateKey(new Date(2026, 9, 3, 23, 30))).toBe('2026-10-03');
  });

  it('pads single-digit months and days', () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('nextRunId()', () => {
  const startedAt = new Date(2026, 9, 3, 9, 0);

  it('starts the first run of a day at one', () => {
    expect(nextRunId(['2026-10-02-1', '2026-10-02-2'], startedAt)).toBe('2026-10-03-1');
  });

  it('follows the highest ordinal recorded for the same day', () => {
    expect(nextRunId(['2026-10-03-1', '2026-10-03-2', '2026-10-02-7'], startedAt)).toBe(
      '2026-10-03-3',
    );
  });

  it('compares ordinals numerically rather than as text', () => {
    expect(nextRunId(['2026-10-03-9', '2026-10-03-10'], startedAt)).toBe('2026-10-03-11');
  });
});
