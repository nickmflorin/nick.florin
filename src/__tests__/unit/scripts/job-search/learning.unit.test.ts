import { BarrenAfter, buildLearningReport } from '~/scripts/job-search/learning/report';
import { type PostingScore, PreferencesSchema } from '~/scripts/job-search/schemas';

import { MinimalPreferences, posting } from './fixtures';

const { scoring } = PreferencesSchema.parse(MinimalPreferences);

const Now = new Date('2026-10-04T12:00:00.000Z');

const score = (total: number): PostingScore => ({
  dealbreakers: [],
  dimensions: { company: 70, domain: 70, notes: 70, seniority: 70, stack: 70 },
  flags: [],
  gaps: [],
  rationale: 'A placeholder assessment.',
  total,
});

const fromSearch = (search: string, id: number, total: null | number) =>
  posting({
    firstSeenAt: '2026-10-01T12:00:00.000Z',
    id: String(4012345000 + id),
    score: total === null ? null : score(total),
    source: { kind: 'search', run: '2026-10-01-1', search },
  });

describe('buildLearningReport()', () => {
  it("counts each source's postings, scored postings, and postings scored into the queue", () => {
    expect(
      buildLearningReport(
        [
          fromSearch('frontend', 1, 85),
          fromSearch('frontend', 2, 55),
          fromSearch('frontend', 3, null),
        ],
        { days: 30, now: Now, scoring },
      ).sources,
    ).toStrictEqual([{ barren: false, found: 3, queued: 1, scored: 2, source: 'frontend' }]);
  });

  it('marks a source barren once it has led to many postings and none worth applying to', () => {
    const postings = Array.from({ length: BarrenAfter }, (_, index) =>
      fromSearch('staff', index, 40),
    );
    expect(buildLearningReport(postings, { days: 30, now: Now, scoring }).sources).toMatchObject([
      { barren: true, source: 'staff' },
    ]);
  });

  it('collects the reasons Nick gave for skipping postings', () => {
    expect(
      buildLearningReport(
        [
          {
            ...fromSearch('frontend', 1, 75),
            review: { decision: 'skipped', reason: 'Too backend', reviewedAt: Now.toISOString() },
          },
        ],
        { days: 30, now: Now, scoring },
      ).skips,
    ).toStrictEqual([
      { company: posting().company, reason: 'Too backend', title: posting().title },
    ]);
  });
});
