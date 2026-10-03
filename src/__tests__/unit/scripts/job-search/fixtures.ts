import { type Posting } from '~/scripts/job-search/schemas';

/**
 * Builds a posting of placeholder data that satisfies the posting schema, with any fields
 * overridden.
 *
 * @param {Partial<Posting>} overrides The fields that differ from the placeholder posting.
 *
 * @returns {Posting} The placeholder posting, with the overrides applied.
 */
export const posting = (overrides: Partial<Posting> = {}): Posting => ({
  application: null,
  applyVia: 'easy-apply',
  company: 'Acme',
  filterReason: null,
  fingerprint: 'acme|senior-frontend-engineer',
  firstSeenAt: '2026-10-03T14:00:00.000Z',
  id: '4012345678',
  review: { decision: null, reason: null, reviewedAt: null },
  score: null,
  source: { kind: 'search', run: '2026-10-03-1', search: 'senior-frontend-remote' },
  status: 'queued',
  title: 'Senior Frontend Engineer',
  url: 'https://www.linkedin.com/jobs/view/4012345678',
  ...overrides,
});

/**
 * The smallest `preferences.yaml` the schema accepts: the required fields only, all placeholders.
 */
export const MinimalPreferences = {
  hard: {
    companies: { currentEmployer: 'Initech' },
    compensation: { floor: 150000 },
    sponsorshipRequired: false,
    titles: { include: ['senior software engineer'] },
    workplace: ['remote'],
  },
};
