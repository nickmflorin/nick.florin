import { CompanyBinding } from './bindings/company';
import { CompetencyBinding } from './bindings/competency';
import {
  type ContentBinding,
  type ParsedRecord,
  type SluggedFieldCodecRecord,
} from './bindings/content-binding';
import { DegreeBinding } from './bindings/degree';
import { ProfileBinding } from './bindings/profile';
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
 * The set-level validations that no single record can perform on itself: duplicate slugs within
 * an entity, and slug references that do not resolve to a loaded record. Runs before any write,
 * so an inconsistent set fails hard without committing anything.
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
};
