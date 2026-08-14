import { type Transaction } from '~/database/prisma';
import { slugify } from '~/lib/formatters/slugify';

import { type IssueCollector } from './issues';

/**
 * The correlation a record of one of the three superseded entities makes to its legacy counterpart
 * row, as a discriminated union because the key differs per entity: a competency correlates by its
 * own slug or label, while a role and a degree have no legacy slug to match on and correlate by
 * their unique `(title, company)` and `(major, school)` pairs instead.
 */
export type LegacyCorrelation =
  | {
      readonly company: string;
      readonly entity: 'role';
      readonly slug: string;
      readonly title: string;
    }
  | {
      readonly entity: 'competency';
      readonly label: string;
      readonly slug: string;
    }
  | {
      readonly entity: 'degree';
      readonly major: string;
      readonly school: string;
      readonly shortMajor: null | string;
      readonly slug: string;
    };

/**
 * Resolves the creation timestamp a newly created record inherits from the legacy row it succeeds,
 * or `undefined` when no counterpart matches — in which case the column keeps its `now()` default
 * and the miss is reported as a warning.
 *
 * Website ordering is derived from creation time, so a push that stamped `now()` on every row would
 * silently reorder published content at the moment of adoption. Only creates consult this: a record
 * that already exists in the new tables takes the update path, and the extended client's metadata
 * middleware prohibits `createdAt` on an update regardless.
 */
export type LegacyCreatedAtResolver = (
  correlation: LegacyCorrelation,
  issues: IssueCollector,
) => Date | undefined;

/**
 * A resolver that inherits nothing, for callers with no legacy tables to consult — a test, or a
 * push against a database where the superseded models are already gone.
 */
export const NoLegacyCreatedAt: LegacyCreatedAtResolver = () => undefined;

const compositeKey = (owner: string, value: string): string => `${owner}::${value}`;

/**
 * Loads every legacy row once and closes a {@link LegacyCreatedAtResolver} over the lookups, so
 * that seeding costs three queries for a whole run rather than one per record.
 *
 * `Company` and `School` rows are shared between the legacy and current models, so the owner side
 * of each composite key correlates exactly; only the slug has to be derived the same way the
 * company and school codecs derive it, because legacy rows predate the column.
 */
export const buildLegacyCreatedAtResolver = async (
  tx: Transaction,
): Promise<LegacyCreatedAtResolver> => {
  const [skills, experiences, educations] = await Promise.all([
    tx.skill.findMany({ select: { createdAt: true, label: true, slug: true } }),
    tx.experience.findMany({
      select: { company: { select: { name: true, slug: true } }, createdAt: true, title: true },
    }),
    tx.education.findMany({
      select: {
        createdAt: true,
        major: true,
        school: { select: { name: true, slug: true } },
        shortMajor: true,
      },
    }),
  ]);

  const competencyBySlug = new Map(skills.map(skill => [skill.slug, skill.createdAt]));
  const competencyByLabel = new Map(skills.map(skill => [skill.label, skill.createdAt]));

  const ownerSlug = (owner: { readonly name: string; readonly slug: null | string }): string =>
    owner.slug ?? slugify(owner.name);

  const roleByTitle = new Map(
    experiences.map(experience => [
      compositeKey(ownerSlug(experience.company), experience.title),
      experience.createdAt,
    ]),
  );
  const degreeByMajor = new Map(
    educations.flatMap(education => {
      const owner = ownerSlug(education.school);
      const entries: [string, Date][] = [
        [compositeKey(owner, education.major), education.createdAt],
      ];
      if (education.shortMajor !== null) {
        entries.push([compositeKey(owner, education.shortMajor), education.createdAt]);
      }
      return entries;
    }),
  );

  /**
   * The counterpart's creation date, or `null` when none matches.
   *
   * Annotated `Date | null` rather than `Date | undefined` so that the compiler enforces
   * exhaustiveness on its own: a member of {@link LegacyCorrelation} left unhandled would fall off
   * the end and yield `undefined`, which this return type does not admit. That is what makes a
   * `default` clause unnecessary here — one carrying an assertion would have to be maintained, and
   * one carrying a value would silently absorb the very member it exists to catch.
   */
  const lookup = (correlation: LegacyCorrelation): Date | null => {
    switch (correlation.entity) {
      case 'competency':
        return (
          competencyBySlug.get(correlation.slug) ?? competencyByLabel.get(correlation.label) ?? null
        );
      case 'degree':
        return (
          degreeByMajor.get(compositeKey(correlation.school, correlation.major)) ??
          (correlation.shortMajor === null
            ? null
            : (degreeByMajor.get(compositeKey(correlation.school, correlation.shortMajor)) ?? null))
        );
      case 'role':
        return roleByTitle.get(compositeKey(correlation.company, correlation.title)) ?? null;
    }
  };

  return (correlation, issues) => {
    const createdAt = lookup(correlation);
    if (createdAt === null) {
      issues.warning(
        correlation.entity,
        correlation.slug,
        'No legacy counterpart matched, so the record is created with the current time rather ' +
          'than inheriting its original creation date. Any website ordering derived from ' +
          'creation time will place it as new.',
      );
      /* `undefined`, not the `null` the lookup reports: Prisma reads an undefined column as "not
         provided" and applies its default, while a null would try to write one into a column that
         does not accept it. */
      return undefined;
    }
    return createdAt;
  };
};
