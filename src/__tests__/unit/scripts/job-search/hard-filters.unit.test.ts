import { type Preferences, PreferencesSchema } from '~/scripts/job-search/schemas';
import { applyHardFilters, type HardFilterContext } from '~/scripts/job-search/triage/hard-filters';

import { candidate, MinimalPreferences } from './fixtures';

const Card: HardFilterContext = { now: new Date('2026-10-03T12:00:00.000Z'), stage: 'card' };

const Detail: HardFilterContext = { ...Card, stage: 'detail' };

const filtersWith = (hard: Record<string, unknown>): Preferences['hard'] =>
  PreferencesSchema.parse({ hard: { ...MinimalPreferences.hard, ...hard } }).hard;

const Defaults = filtersWith({});

describe('applyHardFilters()', () => {
  it('passes a candidate that satisfies every filter', () => {
    expect(applyHardFilters(candidate(), Defaults, Detail)).toBeNull();
  });

  describe('companies', () => {
    it('rejects the current employer under any legal suffix', () => {
      expect(applyHardFilters(candidate({ company: 'Initech, Inc.' }), Defaults, Card)).toBe(
        "The company 'Initech, Inc.' is the current employer.",
      );
    });

    it('rejects a company whose name begins with a blocked name', () => {
      expect(
        applyHardFilters(
          candidate({ company: 'Globex Labs' }),
          filtersWith({ companies: { block: ['Globex'], currentEmployer: 'Initech' } }),
          Card,
        ),
      ).toBe("The company 'Globex Labs' is blocked as 'Globex'.");
    });

    it('passes a company whose name only shares a blocked name as a prefix of a word', () => {
      expect(
        applyHardFilters(
          candidate({ company: 'Globexville' }),
          filtersWith({ companies: { block: ['Globex'], currentEmployer: 'Initech' } }),
          Card,
        ),
      ).toBeNull();
    });
  });

  describe('apply hosts', () => {
    const blockingLadders = filtersWith({ applyHosts: { block: ['theladders.com'] } });

    it('rejects a posting applying through a blocked site behind the interstitial', () => {
      expect(
        applyHardFilters(
          candidate({
            applyUrl: `https://www.linkedin.com/safety/go/?url=${encodeURIComponent(
              'https://www.theladders.com/linkedin/89096351',
            )}`,
            company: 'Hooli',
          }),
          blockingLadders,
          Detail,
        ),
      ).toBe("The posting applies through the blocked site 'theladders.com'.");
    });

    it('passes a posting whose apply link is unknown or elsewhere', () => {
      expect(applyHardFilters(candidate(), blockingLadders, Card)).toBeNull();
      expect(
        applyHardFilters(
          candidate({ applyUrl: 'https://jobs.ashbyhq.com/hooli/1' }),
          blockingLadders,
          Detail,
        ),
      ).toBeNull();
    });
  });

  describe('titles', () => {
    it('rejects a title containing every word of an excluded term, in any order', () => {
      expect(
        applyHardFilters(
          candidate({ title: 'Manager, Software Engineering' }),
          filtersWith({
            titles: { exclude: ['engineering manager'], include: ['software engineering'] },
          }),
          Card,
        ),
      ).toBe(
        "The title 'Manager, Software Engineering' matches the excluded term " +
          "'engineering manager'.",
      );
    });

    it('matches an included title regardless of word order and punctuation', () => {
      expect(
        applyHardFilters(candidate({ title: 'Software Engineer, Senior' }), Defaults, Card),
      ).toBeNull();
    });

    it.each([
      ['Sr. Front-End Engineer', 'senior frontend engineer'],
      ['Senior Full Stack Engineer II', 'sr. fullstack engineer 2'],
      ['Back End Dev, Senior', 'senior backend developer'],
    ])('matches %j to the included term %j whatever their spellings', (title, term) => {
      expect(
        applyHardFilters(
          candidate({ title }),
          { ...Defaults, titles: { exclude: [], include: [term] } },
          Card,
        ),
      ).toBeNull();
    });

    it('rejects a title matching none of the included titles', () => {
      expect(applyHardFilters(candidate({ title: 'Data Analyst' }), Defaults, Card)).toBe(
        "The title 'Data Analyst' matches none of the included titles.",
      );
    });
  });

  describe('workplace and location', () => {
    const hybridInNewYork = filtersWith({
      locations: ['New York'],
      workplace: ['hybrid', 'remote'],
    });

    it('rejects a workplace that is not accepted', () => {
      expect(applyHardFilters(candidate({ workplace: 'onsite' }), Defaults, Card)).toBe(
        "The workplace 'onsite' is not one of those accepted.",
      );
    });

    it('passes a hybrid role in an accepted location', () => {
      expect(
        applyHardFilters(
          candidate({ location: 'New York, NY', workplace: 'hybrid' }),
          hybridInNewYork,
          Card,
        ),
      ).toBeNull();
    });

    it('rejects a hybrid role outside the accepted locations', () => {
      expect(
        applyHardFilters(
          candidate({ location: 'Austin, TX', workplace: 'hybrid' }),
          hybridInNewYork,
          Card,
        ),
      ).toBe("The hybrid location 'Austin, TX' is not one of those accepted.");
    });

    it('defers an on-site label in an accepted hybrid city to the detail stage', () => {
      const onsiteInNewYork = candidate({ location: 'New York, NY', workplace: 'onsite' });
      expect(applyHardFilters(onsiteInNewYork, hybridInNewYork, Card)).toBeNull();
      expect(applyHardFilters(onsiteInNewYork, hybridInNewYork, Detail)).toBe(
        "The workplace 'onsite' is not one of those accepted.",
      );
    });

    it('rejects an on-site label outside the accepted hybrid cities at once', () => {
      expect(
        applyHardFilters(
          candidate({ location: 'Austin, TX', workplace: 'onsite' }),
          hybridInNewYork,
          Card,
        ),
      ).toBe("The workplace 'onsite' is not one of those accepted.");
    });

    it('defers an unpublished workplace at both stages', () => {
      expect(applyHardFilters(candidate({ workplace: null }), Defaults, Detail)).toBeNull();
    });
  });

  describe('sponsorship and posting age', () => {
    it('rejects a posting without sponsorship when sponsorship is required', () => {
      expect(
        applyHardFilters(
          candidate({ sponsorshipOffered: false }),
          filtersWith({ sponsorshipRequired: true }),
          Card,
        ),
      ).toBe('The posting does not offer the visa sponsorship that is required.');
    });

    it('rejects a posting older than the limit', () => {
      expect(
        applyHardFilters(candidate({ postedAt: '2026-09-01T12:00:00.000Z' }), Defaults, Card),
      ).toBe('The posting is 32 days old, beyond the limit of 14.');
    });
  });

  describe('compensation', () => {
    const rejectUnlisted = filtersWith({ compensation: { floor: 150000, whenUnlisted: 'reject' } });

    it('rejects a range that tops out below the floor', () => {
      expect(
        applyHardFilters(
          candidate({ compensation: { currency: 'USD', maximum: 140000, minimum: 120000 } }),
          Defaults,
          Card,
        ),
      ).toBe('The compensation tops out at 140000 USD, below the floor of 150000.');
    });

    it('compares a range with no maximum by its minimum', () => {
      expect(
        applyHardFilters(
          candidate({ compensation: { currency: 'USD', maximum: null, minimum: 160000 } }),
          Defaults,
          Card,
        ),
      ).toBeNull();
    });

    it('defers unlisted compensation at the card stage, whatever the policy', () => {
      expect(applyHardFilters(candidate({ compensation: null }), rejectUnlisted, Card)).toBeNull();
    });

    it('applies the unlisted policy at the detail stage', () => {
      expect(applyHardFilters(candidate({ compensation: null }), rejectUnlisted, Detail)).toBe(
        'The posting lists no compensation in USD.',
      );
      expect(applyHardFilters(candidate({ compensation: null }), Defaults, Detail)).toBeNull();
    });

    it('treats a range in another currency as unlisted', () => {
      expect(
        applyHardFilters(
          candidate({ compensation: { currency: 'EUR', maximum: 90000, minimum: 80000 } }),
          rejectUnlisted,
          Detail,
        ),
      ).toBe('The posting lists no compensation in USD.');
    });
  });

  describe('company size', () => {
    const smallOnly = filtersWith({ companySize: { bands: ['11-50'], whenUnknown: 'reject' } });

    it('rejects a band that is not accepted', () => {
      expect(applyHardFilters(candidate(), smallOnly, Card)).toBe(
        "The company size '51-200' is not one of the accepted bands.",
      );
    });

    it('defers an unpublished size at the card stage, then applies its policy', () => {
      expect(applyHardFilters(candidate({ companySize: null }), smallOnly, Card)).toBeNull();
      expect(applyHardFilters(candidate({ companySize: null }), smallOnly, Detail)).toBe(
        "The size of 'Acme' is not published.",
      );
    });
  });

  it('reports the first failing filter when several fail', () => {
    expect(
      applyHardFilters(
        candidate({ company: 'Initech', title: 'Data Analyst', workplace: 'onsite' }),
        Defaults,
        Card,
      ),
    ).toBe("The company 'Initech' is the current employer.");
  });
});
