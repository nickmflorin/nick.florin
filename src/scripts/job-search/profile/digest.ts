import { type CanonicalCompany } from '~/database/content/bindings/company';
import { type CanonicalCompetency } from '~/database/content/bindings/competency';
import { contentTreeReferences } from '~/database/content/bindings/content-tree';
import { type CanonicalRole } from '~/database/content/bindings/role';

import { type DateRange, monthsCovered, monthsToYears } from './experience';

export interface CareerContent {
  readonly companies: readonly CanonicalCompany[];
  readonly competencies: readonly CanonicalCompetency[];
  readonly roles: readonly CanonicalRole[];
}

export interface DigestRole {
  readonly company: string;
  readonly competencies: string[];
  /**
   * The month the role ended, of the form `2024-09`, or `null` for a current role.
   */
  readonly end: null | string;
  readonly remote: boolean;
  readonly start: string;
  readonly title: string;
}

export interface DigestCompetency {
  readonly label: string;
  /**
   * The months the competency was in use, across every role that lists it, with overlapping roles
   * counted once.
   */
  readonly months: number;
  readonly proficiency: null | string;
  readonly slug: string;
  /**
   * The years of experience an application form should be answered with: the competency's own
   * stated experience when it has one, and otherwise its months rounded to the nearest year.
   */
  readonly years: number;
}

/**
 * The compact summary of the career content that the scoring agent reads, in place of the fixture
 * files themselves, and that answers "years of experience with" questions on application forms.
 */
export interface ProfileDigest {
  readonly competencies: DigestCompetency[];
  readonly roles: DigestRole[];
}

const toMonth = (date: Date): string => date.toISOString().slice(0, 7);

const roleRange = (role: CanonicalRole, now: Date): DateRange => ({
  end: role.isCurrent || role.endDate === null ? now : role.endDate,
  start: role.startDate,
});

const competencySlugsOf = (role: CanonicalRole): Set<string> =>
  new Set(contentTreeReferences(role.content).map(({ slug }) => slug));

/**
 * Builds the profile digest from the career content.
 *
 * @param {CareerContent} content The companies, competencies and roles from the fixtures.
 * @param {Date} now The time against which a current role's end is measured.
 *
 * @returns {ProfileDigest}
 *   The roles, most recent first, and the competencies, most experienced first. Competencies that
 *   no role lists and that state no experience of their own are omitted, since nothing establishes
 *   time spent with them.
 */
export const buildProfileDigest = (content: CareerContent, now: Date): ProfileDigest => {
  const companyNames = new Map(content.companies.map(({ name, slug }) => [slug, name]));
  const labels = new Map(content.competencies.map(({ label, slug }) => [slug, label]));
  const roles = [...content.roles]
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    .map(role => ({ role, slugs: competencySlugsOf(role) }));
  return {
    competencies: content.competencies
      .map(competency => {
        const months = monthsCovered(
          roles
            .filter(({ slugs }) => slugs.has(competency.slug))
            .map(({ role }) => roleRange(role, now)),
        );
        return {
          label: competency.label,
          months,
          proficiency: competency.proficiency,
          slug: competency.slug,
          years: competency.experience ?? monthsToYears(months),
        };
      })
      .filter(({ months, years }) => months > 0 || years > 0)
      .sort((a, b) => b.months - a.months || a.label.localeCompare(b.label)),
    roles: roles.map(({ role, slugs }) => ({
      company: companyNames.get(role.company) ?? role.company,
      competencies: [...slugs].map(slug => labels.get(slug) ?? slug),
      end: role.isCurrent || role.endDate === null ? null : toMonth(role.endDate),
      remote: role.isRemote,
      start: toMonth(role.startDate),
      title: role.title,
    })),
  };
};
