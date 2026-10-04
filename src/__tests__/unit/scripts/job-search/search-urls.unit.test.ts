import { buildSearchUrl, searchNameFor } from '~/scripts/job-search/discovery/search-urls';
import { LinkedInJobSearchUrl, PreferencesSchema } from '~/scripts/job-search/schemas';

describe('buildSearchUrl()', () => {
  it('applies the workplaces, posting age, levels and Easy Apply through LinkedIn filters', () => {
    const url = new URL(
      buildSearchUrl(
        {
          easyApplyOnly: true,
          experienceLevels: ['mid-senior', 'director'],
          keywords: '  senior frontend engineer ',
          location: 'United States',
        },
        { postedWithinDays: 7, workplace: ['remote', 'hybrid'] },
      ),
    );
    expect(`${url.origin}${url.pathname}`).toBe(LinkedInJobSearchUrl);
    expect([...url.searchParams]).toStrictEqual([
      ['keywords', 'senior frontend engineer'],
      ['location', 'United States'],
      ['f_WT', '2,3'],
      ['f_TPR', 'r604800'],
      ['f_E', '4,5'],
      ['f_AL', 'true'],
      ['sortBy', 'DD'],
    ]);
  });

  it('omits the optional filters when they are not given', () => {
    const url = new URL(
      buildSearchUrl(
        { easyApplyOnly: false, experienceLevels: [], keywords: 'staff engineer', location: null },
        { postedWithinDays: 14, workplace: ['remote'] },
      ),
    );
    expect([...url.searchParams.keys()].toSorted()).toStrictEqual([
      'f_TPR',
      'f_WT',
      'keywords',
      'sortBy',
    ]);
  });

  it('builds a URL that the preferences schema accepts as a search', () => {
    const url = buildSearchUrl(
      { easyApplyOnly: true, experienceLevels: [], keywords: 'react engineer', location: null },
      { postedWithinDays: 14, workplace: ['remote'] },
    );
    expect(() =>
      PreferencesSchema.shape.searches.parse([
        { name: searchNameFor('react engineer'), origin: 'generated', url },
      ]),
    ).not.toThrow();
  });
});

describe('searchNameFor()', () => {
  it('derives a hyphen-case name from the keywords', () => {
    expect(searchNameFor('Senior Front-End Engineer (React)')).toBe(
      'senior-front-end-engineer-react',
    );
  });
});
