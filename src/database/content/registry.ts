import { CompanyBinding } from './bindings/company';
import { CompetencyBinding } from './bindings/competency';
import {
  type ContentBinding,
  type ParsedRecord,
  type SluggedFieldCodecRecord,
} from './bindings/content-binding';
import { CourseBinding } from './bindings/course';
import { DegreeBinding } from './bindings/degree';
import { ProfileBinding } from './bindings/profile';
import { ProjectBinding } from './bindings/project';
import { RepositoryBinding } from './bindings/repository';
import { ResumeSheetBinding } from './bindings/resume-sheet';
import { RoleBinding } from './bindings/role';
import { SchoolBinding } from './bindings/school';
import { type IssueCollector } from './issues';

export type AnyContentBinding = ContentBinding<SluggedFieldCodecRecord>;

/**
 * Every content binding, in dependency order: a binding appears after everything it references,
 * so iterating this list is a valid write order and a valid validation order.
 */
export const ContentBindings: readonly AnyContentBinding[] = [
  new CompanyBinding(),
  new SchoolBinding(),
  new CompetencyBinding(),
  new ProfileBinding(),
  new RoleBinding(),
  new DegreeBinding(),
  new ResumeSheetBinding(),
  new RepositoryBinding(),
  new ProjectBinding(),
  new CourseBinding(),
];

export const findBinding = (key: string): AnyContentBinding => {
  const binding = ContentBindings.find(candidate => candidate.key === key);
  if (binding === undefined) {
    throw new TypeError(`There is no content binding registered under the key '${key}'.`);
  }
  return binding;
};

/**
 * One entity's records paired with the binding that produced them, as loaded from a store.
 */
export interface LoadedContent {
  readonly binding: AnyContentBinding;
  readonly records: readonly ParsedRecord<SluggedFieldCodecRecord>[];
}

/**
 * The entities a resume sheet claims outright rather than merely referencing, paired with the
 * field that claims them.
 *
 * A sheet's roles and degrees are a one-to-many owned through a foreign key on the referenced row,
 * not a join table, so a role listed on two sheets does not belong to both — it silently lands on
 * whichever sheet is written last, and writing the other disconnects it. No sheet can detect that
 * on its own, which is what makes it a set-level invariant.
 */
const ExclusiveSheetClaims = [
  { entity: 'degree', field: 'degrees' },
  { entity: 'role', field: 'roles' },
] as const;

const validateExclusiveSheetClaims = (
  set: readonly LoadedContent[],
  issues: IssueCollector,
): void => {
  const sheets = set.find(entry => entry.binding.key === 'resume-sheet');
  if (sheets === undefined) {
    return;
  }
  for (const { entity, field } of ExclusiveSheetClaims) {
    const claimedBy = new Map<string, string>();
    for (const sheet of sheets.records) {
      /* The mapped record type cannot be indexed by a runtime key; the field is a slug reference
         list on every resume sheet, which the runtime check below re-establishes. */
      const claims = (sheet as Record<string, unknown>)[field];
      if (!Array.isArray(claims)) {
        continue;
      }
      for (const slug of claims) {
        if (typeof slug !== 'string') {
          continue;
        }
        const owner = claimedBy.get(slug);
        if (owner !== undefined) {
          issues.error(
            'resume-sheet',
            sheet.slug,
            `The ${entity} '${slug}' is already claimed by the sheet '${owner}'. A ${entity} ` +
              'belongs to exactly one sheet, so listing it on a second would silently detach it ' +
              'from the first.',
          );
        }
        claimedBy.set(slug, sheet.slug);
      }
    }
  }
};

/**
 * The set-level validations that no single record can perform on itself: duplicate slugs within
 * an entity, slug references that do not resolve to a loaded record, and the exclusive claims a
 * resume sheet makes on its roles and degrees. Runs before any write, so an inconsistent set fails
 * hard without committing anything.
 */
export const validateContentSet = (set: readonly LoadedContent[], issues: IssueCollector): void => {
  const slugsByEntity = new Map<string, Set<string>>();
  for (const { binding, records } of set) {
    const seen = new Set<string>();
    for (const record of records) {
      const slug = binding.slugOf(record);
      if (seen.has(slug)) {
        issues.error(
          binding.key,
          slug,
          'Duplicate slug: slugs are the correlation key and must ' + 'be unique within an entity.',
        );
      }
      seen.add(slug);
    }
    slugsByEntity.set(binding.key, seen);
  }
  for (const { binding, records } of set) {
    for (const record of records) {
      for (const reference of binding.references(record)) {
        const known = slugsByEntity.get(reference.entity);
        if (!known?.has(reference.slug)) {
          issues.error(
            binding.key,
            binding.slugOf(record),
            `The ${reference.entity} reference '${reference.slug}' does not resolve to any ` +
              'loaded record.',
          );
        }
      }
    }
  }
  validateExclusiveSheetClaims(set, issues);
};
