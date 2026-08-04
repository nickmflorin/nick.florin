/**
 * Display strings derived from the model.
 *
 * Dates, locations and degree titles used to be authored as finished strings. They are now real
 * fields, so the formatting that used to live in the data lives here instead — which is what lets
 * the same records render differently per medium later on.
 */
import { type Degree, DegreeType, type Role } from '../data/types';

const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * How a degree's level reads in front of its major. `M.S. in Engineering; Financial Mathematics`
 * is one string rather than two fields because the semicolon is part of the convention the school
 * uses, not a separator this code invented.
 */
const DegreePrefixes: Record<DegreeType, string> = {
  [DegreeType.BachelorsOfScience]: 'B.S. in',
  [DegreeType.MastersOfScience]: 'M.S. in',
  [DegreeType.MastersOfScienceInEngineering]: 'M.S. in Engineering;',
};

/**
 * Formats a date as an abbreviated month and year.
 *
 * Read in UTC deliberately: the dates are authored as bare days, so reading them locally would
 * shift them backwards for anyone west of Greenwich and silently change the month.
 */
const monthAndYear = (date: Date): string =>
  `${Months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

type DateRange = {
  readonly isPostponed?: boolean;
} & Pick<Role, 'endDate' | 'isCurrent' | 'startDate'>;

/**
 * Formats the date range beneath a role or degree, for example `Oct 2024 - Present`.
 *
 * @param {DateRange} range The record whose dates are being formatted.
 *
 * @returns {string} The formatted range.
 */
export function formatDateRange(range: DateRange): string {
  const start = monthAndYear(range.startDate);
  if (range.isCurrent) {
    return `${start} - Present`;
  } else if (range.isPostponed === true) {
    return `${start} - Postponed`;
  } else if (range.endDate === null) {
    return start;
  }
  return `${start} - ${monthAndYear(range.endDate)}`;
}

/**
 * Formats where a role was worked.
 *
 * A remote role reads as `Remote` and carries no city or state, which is why this cannot fall back
 * to the company's location: the company has a headquarters whether or not the work happened
 * there.
 */
export const formatRoleLocation = (role: Pick<Role, 'city' | 'isRemote' | 'state'>): string => {
  if (role.isRemote) {
    return 'Remote';
  } else if (role.city === null || role.state === null) {
    return '';
  }
  return `${role.city}, ${role.state}`;
};

export const formatDegreeTitle = (degree: Pick<Degree, 'degree' | 'major'>): string =>
  `${DegreePrefixes[degree.degree]} ${degree.major}`;
