import { LinkedInJobSearchUrl, type Preferences, type Workplace } from '../schemas';

const SecondsPerDay = 24 * 60 * 60;

/**
 * The page of postings that LinkedIn recommends from the profile, read without any search filters.
 */
export const LinkedInRecommendationsUrl = 'https://www.linkedin.com/jobs/collections/recommended/';

/**
 * The experience levels LinkedIn's job search filters by, in its own order.
 */
export const ExperienceLevels = [
  'internship',
  'entry',
  'associate',
  'mid-senior',
  'director',
  'executive',
] as const;

export type ExperienceLevel = (typeof ExperienceLevels)[number];

/**
 * The codes LinkedIn's job search uses for each experience level, in its `f_E` parameter.
 */
const ExperienceLevelCodes = {
  associate: '3',
  director: '5',
  entry: '2',
  executive: '6',
  internship: '1',
  'mid-senior': '4',
} as const satisfies Record<ExperienceLevel, string>;

/**
 * The codes LinkedIn's job search uses for each workplace, in its `f_WT` parameter.
 */
const WorkplaceCodes = {
  hybrid: '3',
  onsite: '1',
  remote: '2',
} as const satisfies Record<Workplace, string>;

export interface SearchSpec {
  readonly easyApplyOnly: boolean;
  readonly experienceLevels: readonly ExperienceLevel[];
  readonly keywords: string;
  /**
   * The location LinkedIn searches within, such as `United States`. LinkedIn falls back to the
   * signed-in profile's location when it is omitted.
   */
  readonly location: null | string;
}

/**
 * Builds a LinkedIn job-search URL that applies, through LinkedIn's own filters, as many of the
 * hard filters as LinkedIn can apply itself: the accepted workplaces and the posting age. Results
 * are ordered newest first, so that a run reaches the postings it has not seen before the ones
 * earlier runs recorded.
 *
 * Filtering in the URL is what keeps a run's page views low: postings LinkedIn has already excluded
 * never cost a result-card read.
 *
 * @param {SearchSpec} spec The keywords, levels, location and Easy Apply restriction.
 * @param {Pick<Preferences['hard'], 'postedWithinDays' | 'workplace'>} hard
 *   The hard filters LinkedIn can apply.
 *
 * @returns {string} The URL of the search's results page, newest postings first.
 */
export const buildSearchUrl = (
  spec: SearchSpec,
  hard: Pick<Preferences['hard'], 'postedWithinDays' | 'workplace'>,
): string => {
  const url = new URL(LinkedInJobSearchUrl);
  url.search = new URLSearchParams([
    ['keywords', spec.keywords.trim()],
    ...(spec.location === null ? [] : [['location', spec.location]]),
    ['f_WT', hard.workplace.map(workplace => WorkplaceCodes[workplace]).join(',')],
    ['f_TPR', `r${hard.postedWithinDays * SecondsPerDay}`],
    ...(spec.experienceLevels.length === 0
      ? []
      : [['f_E', spec.experienceLevels.map(level => ExperienceLevelCodes[level]).join(',')]]),
    ...(spec.easyApplyOnly ? [['f_AL', 'true']] : []),
    ['sortBy', 'DD'],
  ]).toString();
  return url.toString();
};

/**
 * Derives a search's name from its keywords, in the hyphen-case form that `preferences.yaml`
 * requires of search names.
 */
export const searchNameFor = (keywords: string): string =>
  keywords
    .toLowerCase()
    .split(/[^a-z0-9]+/u)
    .filter(word => word !== '')
    .join('-');
