import { type Candidate, type Posting } from '~/scripts/job-search/schemas';

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
  applyUrl: null,
  applyVia: 'easy-apply',
  company: 'Acme',
  compensation: null,
  description: null,
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

/**
 * Builds a candidate posting of placeholder data, as a browser pass would read it, with any fields
 * overridden. By default it publishes every fact and passes {@link MinimalPreferences}.
 *
 * @param {Partial<Candidate>} overrides The fields that differ from the placeholder candidate.
 *
 * @returns {Candidate} The placeholder candidate, with the overrides applied.
 */
export const candidate = (overrides: Partial<Candidate> = {}): Candidate => ({
  applyUrl: null,
  applyVia: 'easy-apply',
  company: 'Acme',
  companySize: '51-200',
  compensation: { currency: 'USD', maximum: 200000, minimum: 170000 },
  id: '4012345678',
  location: 'United States',
  postedAt: '2026-10-02T12:00:00.000Z',
  source: { kind: 'search', search: 'senior-frontend-remote' },
  sponsorshipOffered: null,
  title: 'Senior Software Engineer',
  workplace: 'remote',
  ...overrides,
});
