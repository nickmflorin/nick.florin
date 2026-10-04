import { LinkedInJobSearchUrl, type Preferences } from '../schemas';

const SecondsPerDay = 24 * 60 * 60;

/**
 * The page of postings that LinkedIn recommends from the profile, read without any search filters.
 */
export const LinkedInRecommendationsUrl = 'https://www.linkedin.com/jobs/collections/recommended/';

/**
 * Builds a LinkedIn job-search URL for a query phrase.
 *
 * LinkedIn's job search interprets the query as natural language and discards most URL filters —
 * workplace, experience level, location and sort order among them — so the query phrase itself
 * carries the workplace and location, as in `senior software engineer remote` or `senior software
 * engineer hybrid Washington DC`. Only the posting age, which LinkedIn still honors, rides in the
 * URL. Whatever LinkedIn does apply is read back from the results page on every run.
 *
 * @param {string} query The query phrase, including any workplace and location.
 * @param {Pick<Preferences['hard'], 'postedWithinDays'>} hard The posting-age limit.
 *
 * @returns {string} The URL of the search's results page.
 */
export const buildSearchUrl = (
  query: string,
  { postedWithinDays }: Pick<Preferences['hard'], 'postedWithinDays'>,
): string => {
  const url = new URL(LinkedInJobSearchUrl);
  url.search = new URLSearchParams([
    ['keywords', query.trim().replace(/\s+/gu, ' ')],
    ['f_TPR', `r${postedWithinDays * SecondsPerDay}`],
  ]).toString();
  return url.toString();
};

/**
 * Derives a search's name from its query phrase, in the hyphen-case form that `preferences.yaml`
 * requires of search names.
 */
export const searchNameFor = (query: string): string =>
  query
    .toLowerCase()
    .split(/[^a-z0-9]+/u)
    .filter(word => word !== '')
    .join('-');
