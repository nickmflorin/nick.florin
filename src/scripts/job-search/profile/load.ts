import path from 'node:path';

import { CompanyBinding } from '~/database/content/bindings/company';
import { CompetencyBinding } from '~/database/content/bindings/competency';
import { ProfileBinding } from '~/database/content/bindings/profile';
import { RoleBinding } from '~/database/content/bindings/role';
import { IssueCollector } from '~/database/content/issues';
import { YamlFixtureStore } from '~/database/content/stores/yaml-fixture-store';

import { type CareerContent } from './digest';

/**
 * The directory holding the career content's YAML fixtures, which are the public, canonical record
 * of the career that the job-search tooling reads from.
 */
export const FixturesDirectory = path.join(process.cwd(), 'src', 'documents', 'resume', 'fixtures');

/**
 * Reads the companies, competencies and roles from the fixtures, validated by the same bindings the
 * content sync uses.
 *
 * @throws {Error} If any fixture fails validation.
 *
 * @returns {Promise<CareerContent>} The validated companies, competencies and roles.
 */
export const loadCareerContent = async (): Promise<CareerContent> => {
  const store = new YamlFixtureStore(FixturesDirectory);
  const issues = new IssueCollector();
  const [companies, competencies, roles] = await Promise.all([
    store.read(new CompanyBinding(), issues),
    store.read(new CompetencyBinding(), issues),
    store.read(new RoleBinding(), issues),
  ]);
  issues.assertValid();
  return { companies, competencies, roles };
};

/**
 * Reads the first and last name from the profile fixture, which name the approved resume file that
 * employers receive.
 *
 * @throws {Error} If the profile fixture fails validation.
 *
 * @returns {Promise<{ readonly firstName: string; readonly lastName: string }>} The names.
 */
export const loadProfileName = async (): Promise<{
  readonly firstName: string;
  readonly lastName: string;
}> => {
  const issues = new IssueCollector();
  const profile = (
    await new YamlFixtureStore(FixturesDirectory).read(new ProfileBinding(), issues)
  ).at(0);
  issues.assertValid();
  if (profile === undefined) {
    throw new Error('The profile fixture holds no profile.');
  }
  return { firstName: profile.firstName, lastName: profile.lastName };
};
