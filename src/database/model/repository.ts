import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { environment } from '~/environment';

import { type BrandProject, type BrandRepository } from './brand';
import { type ConditionallyInclude } from './inclusion';
import { type ApiSkill } from './skills';

export const getRepositoryGithubUrl = (repository: Pick<BrandRepository, 'slug'>): string => {
  let basePath = environment.get('NEXT_PUBLIC_GITHUB_PROFILE_PREFIX');
  if (!basePath.endsWith('/')) {
    basePath = `${basePath}/`;
  }
  return `${basePath}${repository.slug}`;
};

export const getNpmPackageUrl = (packageName: string): string =>
  `https://www.npmjs.com/package/${packageName}`;

export const RepositoryIncludesFields = enumeratedLiterals(['skills', 'projects'] as const, {});
export type RepositoryIncludesField = EnumeratedLiteralsMember<typeof RepositoryIncludesFields>;

export type RepositoryIncludes = RepositoryIncludesField[];

export type ApiRepository<I extends RepositoryIncludes = []> = ConditionallyInclude<
  {
    readonly projects: BrandProject[];
    readonly skills: ApiSkill[];
  } & BrandRepository,
  ['skills', 'projects'],
  I
>;
