import { buildSearchUrl, searchNameFor } from '~/scripts/job-search/discovery/search-urls';
import { LinkedInJobSearchUrl, PreferencesSchema } from '~/scripts/job-search/schemas';

describe('buildSearchUrl()', () => {
  it('carries the query phrase and the posting age, and nothing LinkedIn discards', () => {
    const url = new URL(
      buildSearchUrl('  senior software engineer   hybrid Washington DC ', { postedWithinDays: 7 }),
    );
    expect(`${url.origin}${url.pathname}`).toBe(LinkedInJobSearchUrl);
    expect([...url.searchParams]).toStrictEqual([
      ['keywords', 'senior software engineer hybrid Washington DC'],
      ['f_TPR', 'r604800'],
    ]);
  });

  it('builds a URL that the preferences schema accepts as a search', () => {
    const query = 'senior full stack engineer remote';
    expect(() =>
      PreferencesSchema.shape.searches.parse([
        {
          name: searchNameFor(query),
          origin: 'generated',
          url: buildSearchUrl(query, { postedWithinDays: 14 }),
        },
      ]),
    ).not.toThrow();
  });
});

describe('searchNameFor()', () => {
  it('derives a hyphen-case name from the query phrase', () => {
    expect(searchNameFor('Senior Front-End Engineer (React) remote')).toBe(
      'senior-front-end-engineer-react-remote',
    );
  });
});
