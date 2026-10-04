import { resolveApplyDestination } from '../discovery/apply-systems';
import { companyNameWords, toWords } from '../ledger/fingerprint';
import {
  type Candidate,
  type Preferences,
  type TriageStage,
  type UnlistedPolicy,
} from '../schemas';

type HardFilters = Preferences['hard'];

const MillisecondsPerDay = 24 * 60 * 60 * 1000;

export interface HardFilterContext {
  readonly now: Date;
  readonly stage: TriageStage;
}

/**
 * A single hard filter: the reason it rejects the candidate, or `null` when the candidate passes.
 */
type HardFilter = (
  candidate: Candidate,
  filters: HardFilters,
  context: HardFilterContext,
) => null | string;

/**
 * Words that job titles spell more than one way, by the one spelling titles are compared in.
 */
const TitleSynonyms = new Map([
  ['dev', 'developer'],
  ['eng', 'engineer'],
  ['engr', 'engineer'],
  ['ii', '2'],
  ['iii', '3'],
  ['iv', '4'],
  ['jr', 'junior'],
  ['mgr', 'manager'],
  ['sr', 'senior'],
]);

/**
 * Compounds that job titles write as one word or two, by the one word they are compared as.
 */
const TitleCompounds = new Map([
  ['back end', 'backend'],
  ['front end', 'frontend'],
  ['full stack', 'fullstack'],
]);

/**
 * Splits a job title, or a configured title term, into the words titles are compared in:
 * abbreviations and roman numerals take one spelling and split compounds are joined, so that
 * `Sr. Front-End Engineer II` and `senior frontend engineer 2` have the same words.
 */
const titleWords = (text: string): string[] =>
  toWords(text)
    .map(word => TitleSynonyms.get(word) ?? word)
    .reduce<string[]>((words, word) => {
      const compound = TitleCompounds.get(`${words.at(-1) ?? ''} ${word}`);
      return compound === undefined ? [...words, word] : [...words.slice(0, -1), compound];
    }, []);

/**
 * Whether every word of a configured term appears among the words of a text, in any order, so that
 * the location `Arlington VA` matches `Arlington, VA`.
 */
const containsAllWords = (text: string, term: string): boolean => {
  const words = new Set(toWords(text));
  return toWords(term).every(word => words.has(word));
};

/**
 * Whether every word of a configured title term appears among the words of a title, in any order
 * and whatever its spelling, so that the term `senior software engineer` matches the title
 * `Software Engineer, Sr.`.
 */
const titleContains = (title: string, term: string): boolean => {
  const words = new Set(titleWords(title));
  return titleWords(term).every(word => words.has(word));
};

/**
 * Whether a configured company name names the candidate's company: its words, legal suffixes aside,
 * begin the company's words, so that `Acme` names `Acme, Inc.` and `Acme Labs` but not `Acmeville`.
 */
const namesCompany = (configured: string, company: string): boolean => {
  const configuredWords = companyNameWords(configured);
  const companyWords = companyNameWords(company);
  return (
    configuredWords.length > 0 &&
    configuredWords.every((word, index) => companyWords.at(index) === word)
  );
};

/**
 * Decides a fact the candidate does not publish. The `card` stage defers it, because the full
 * posting may publish it; the `detail` stage applies the configured policy.
 */
const decideUnlisted = (
  policy: UnlistedPolicy,
  context: HardFilterContext,
  reason: string,
): null | string => (context.stage === 'detail' && policy === 'reject' ? reason : null);

const filterBlockedCompany: HardFilter = ({ company }, { companies }) => {
  if (namesCompany(companies.currentEmployer, company)) {
    return `The company '${company}' is the current employer.`;
  }
  const blocked = companies.block.find(configured => namesCompany(configured, company));
  return blocked === undefined ? null : `The company '${company}' is blocked as '${blocked}'.`;
};

const filterTitle: HardFilter = ({ title }, { titles }) => {
  const excluded = titles.exclude.find(term => titleContains(title, term));
  if (excluded !== undefined) {
    return `The title '${title}' matches the excluded term '${excluded}'.`;
  }
  return titles.include.some(term => titleContains(title, term))
    ? null
    : `The title '${title}' matches none of the included titles.`;
};

const isAcceptedLocation = (location: string, filters: HardFilters): boolean =>
  filters.locations.some(accepted => containsAllWords(location, accepted));

/**
 * Whether a result card's `onsite` label should be left for the full posting to settle: the role is
 * in a city where hybrid work is accepted, and LinkedIn's workplace label is sometimes contradicted
 * by the description — a role labeled on-site that describes two office days a week.
 */
const mayBeMislabeledHybrid = (
  { location, workplace }: Candidate,
  filters: HardFilters,
  { stage }: HardFilterContext,
): boolean =>
  stage === 'card' &&
  workplace === 'onsite' &&
  filters.workplace.includes('hybrid') &&
  location !== null &&
  isAcceptedLocation(location, filters);

const filterWorkplace: HardFilter = (candidate, filters, context) => {
  const { location, workplace } = candidate;
  if (workplace === null || mayBeMislabeledHybrid(candidate, filters, context)) {
    return null;
  } else if (!filters.workplace.includes(workplace)) {
    return `The workplace '${workplace}' is not one of those accepted.`;
  } else if (workplace === 'remote' || filters.locations.length === 0 || location === null) {
    return null;
  }
  return isAcceptedLocation(location, filters)
    ? null
    : `The ${workplace} location '${location}' is not one of those accepted.`;
};

const filterSponsorship: HardFilter = ({ sponsorshipOffered }, { sponsorshipRequired }) =>
  sponsorshipRequired && sponsorshipOffered === false
    ? 'The posting does not offer the visa sponsorship that is required.'
    : null;

const filterPostingAge: HardFilter = ({ postedAt }, { postedWithinDays }, { now }) => {
  if (postedAt === null) {
    return null;
  }
  const ageInDays = (now.getTime() - new Date(postedAt).getTime()) / MillisecondsPerDay;
  return ageInDays > postedWithinDays
    ? `The posting is ${Math.floor(ageInDays)} days old, beyond the limit of ${postedWithinDays}.`
    : null;
};

/**
 * Rejects a candidate whose compensation range tops out below the floor.
 *
 * A range in a currency other than the floor's is treated as unlisted rather than compared, since
 * no exchange rate is known to compare it at.
 */
const filterCompensation: HardFilter = ({ compensation }, filters, context) => {
  const { currency, floor, whenUnlisted } = filters.compensation;
  const top =
    compensation?.currency === currency ? (compensation.maximum ?? compensation.minimum) : null;
  if (top === null) {
    return decideUnlisted(
      whenUnlisted,
      context,
      `The posting lists no compensation in ${currency}.`,
    );
  }
  return top < floor
    ? `The compensation tops out at ${top} ${currency}, below the floor of ${floor}.`
    : null;
};

const filterCompanySize: HardFilter = ({ company, companySize }, filters, context) => {
  if (companySize === null) {
    return decideUnlisted(
      filters.companySize.whenUnknown,
      context,
      `The size of '${company}' is not published.`,
    );
  }
  return filters.companySize.bands.includes(companySize)
    ? null
    : `The company size '${companySize}' is not one of the accepted bands.`;
};

/**
 * Rejects a posting whose external "Apply" link leads to a blocked site — a job board that funnels
 * applicants into its own sign-up — whichever company the posting names. A host matches a blocked
 * domain itself or any of its subdomains.
 */
const filterApplyHost: HardFilter = ({ applyUrl }, { applyHosts }) => {
  const host = applyUrl === null ? null : (resolveApplyDestination(applyUrl)?.hostname ?? null);
  const blocked =
    host === null
      ? undefined
      : applyHosts.block.find(domain => host === domain || host.endsWith(`.${domain}`));
  return blocked === undefined
    ? null
    : `The posting applies through the blocked site '${blocked}'.`;
};

/**
 * Every hard filter, in the order they are applied. The cheapest and most decisive come first, so
 * that a rejection names the most fundamental reason a candidate fails.
 */
const HardFilterSequence: readonly HardFilter[] = [
  filterBlockedCompany,
  filterApplyHost,
  filterTitle,
  filterWorkplace,
  filterSponsorship,
  filterPostingAge,
  filterCompensation,
  filterCompanySize,
];

/**
 * Applies the configured hard filters to a candidate posting.
 *
 * @param {Candidate} candidate The posting as the browser pass read it.
 * @param {HardFilters} filters The hard filters from `preferences.yaml`.
 * @param {HardFilterContext} context
 *   The stage the candidate was read at, which decides whether an unpublished fact is deferred or
 *   decided by its policy, and the current time, against which the posting's age is measured.
 *
 * @returns {null | string}
 *   The reason the first failing filter gives for rejecting the candidate, or `null` when it passes
 *   every filter.
 */
export const applyHardFilters = (
  candidate: Candidate,
  filters: HardFilters,
  context: HardFilterContext,
): null | string =>
  HardFilterSequence.reduce<null | string>(
    (reason, filter) => reason ?? filter(candidate, filters, context),
    null,
  );
