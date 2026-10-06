import { CompanySizeBands, PostingSchema, PreferencesSchema } from '~/scripts/job-search/schemas';

import { MinimalPreferences, posting } from './fixtures';

const SearchUrl = 'https://www.linkedin.com/jobs/search/?keywords=senior%20frontend%20engineer';

describe('preferences schema', () => {
  it('applies every default to a file holding only the required fields', () => {
    expect(PreferencesSchema.parse(MinimalPreferences)).toStrictEqual({
      applying: {
        autoApprove: 'never',
        followCompany: false,
        markTopChoice: false,
        newAccounts: 'ask',
        submit: 'nick',
      },
      coverLetters: { optionalAt: 80 },
      hard: {
        applyHosts: { block: [] },
        companies: { block: [], currentEmployer: 'Initech' },
        companySize: { bands: [...CompanySizeBands], whenUnknown: 'pass' },
        compensation: { currency: 'USD', floor: 150000, whenUnlisted: 'pass' },
        locations: [],
        postedWithinDays: 14,
        sponsorshipRequired: false,
        titles: { exclude: [], include: ['senior software engineer'] },
        workplace: ['remote'],
      },
      limits: {
        cooldownHoursAfterChallenge: 48,
        delaySeconds: [5, 15],
        easyApplyFillsPerDay: 15,
        formStepDelaySeconds: [2, 6],
        linkedinPageViewsPerDay: 120,
        runsPerDay: 2,
      },
      scoring: { maybeAt: 50, queueAt: 70 },
      searches: [],
      signIn: {
        automatic: false,
        emailVariable: 'JOBS_LINKEDIN_EMAIL',
        passwordVariable: 'JOBS_LINKEDIN_PASSWORD',
      },
      soft: {
        companies: { prefer: [], stages: [] },
        domains: { avoid: [], prefer: [] },
        notes: '',
        stack: { avoid: [], preferred: [], required: [] },
      },
    });
  });

  it('reports the current employer as missing when it is omitted', () => {
    expect(() =>
      PreferencesSchema.parse({
        hard: { ...MinimalPreferences.hard, companies: { block: ['Globex'] } },
      }),
    ).toThrow('currentEmployer');
  });

  it('rejects a maybe threshold that does not sit below the queue threshold', () => {
    expect(() =>
      PreferencesSchema.parse({ ...MinimalPreferences, scoring: { maybeAt: 70, queueAt: 70 } }),
    ).toThrow('The maybe threshold must sit below the queue threshold.');
  });

  it('rejects a search name used more than once', () => {
    expect(() =>
      PreferencesSchema.parse({
        ...MinimalPreferences,
        searches: [
          { name: 'senior-frontend', origin: 'generated', url: SearchUrl },
          { name: 'senior-frontend', origin: 'manual', url: SearchUrl },
        ],
      }),
    ).toThrow("The search name 'senior-frontend' is used more than once.");
  });

  it('rejects a search that does not point at the LinkedIn job search', () => {
    expect(() =>
      PreferencesSchema.parse({
        ...MinimalPreferences,
        searches: [{ name: 'elsewhere', origin: 'manual', url: 'https://example.com/jobs' }],
      }),
    ).toThrow('A search URL must begin with');
  });

  it('rejects a key the schema does not declare', () => {
    expect(() => PreferencesSchema.parse({ ...MinimalPreferences, extra: true })).toThrow(
      'Unrecognized key',
    );
  });
});

describe('posting schema', () => {
  it('accepts a complete posting unchanged', () => {
    expect(PostingSchema.parse(posting())).toStrictEqual(posting());
  });

  it('rejects a job identifier that is not numeric', () => {
    expect(() => PostingSchema.parse(posting({ id: '../4012345678' }))).toThrow('"id"');
  });

  it('rejects a score outside the scale of 0 to 100', () => {
    expect(() =>
      PostingSchema.parse(
        posting({
          score: {
            dealbreakers: [],
            dimensions: { company: 70, domain: 60, notes: 75, seniority: 80, stack: 90 },
            flags: [],
            gaps: [],
            rationale: 'A strong match.',
            total: 140,
          },
        }),
      ),
    ).toThrow('"total"');
  });
});
