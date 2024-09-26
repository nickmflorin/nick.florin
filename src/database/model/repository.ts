import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

import { environment } from "~/environment";

import { type BrandProject, type BrandRepository } from "./brand";
import { type ConditionallyInclude, type InclusionSubset } from "./inclusion";
import { type ApiSkill } from "./skills";

export const getRepositoryGithubUrl = (repository: BrandRepository): string => {
  let basePath = environment.get("NEXT_PUBLIC_GITHUB_PROFILE_PREFIX");
  if (!basePath.endsWith("/")) {
    basePath = `${basePath}/`;
  }
  return `${basePath}${repository.slug}`;
};

export const getNpmPackageUrl = (packageName: string): string =>
  `https://www.npmjs.com/package/${packageName}`;

export const RepositoryIncludesFields = enumeratedLiterals(["skills", "projects"] as const, {});
export type RepositoryIncludesField = EnumeratedLiteralsMember<typeof RepositoryIncludesFields>;

export type RepositoryIncludes =
  | ["skills", "projects"]
  | ["projects", "skills"]
  | ["projects"]
  | ["skills"]
  | [];

export type ApiRepository<I extends RepositoryIncludes = []> = ConditionallyInclude<
  BrandRepository & {
    readonly skills: ApiSkill[];
    readonly projects: BrandProject[];
  },
  ["skills", "projects"],
  I
>;

export const repositoryHasIncludedField = <I extends RepositoryIncludes[number]>(
  repository: ApiRepository<RepositoryIncludes>,
  field: I,
): repository is ApiRepository<InclusionSubset<RepositoryIncludes, I>> => {
  const r = repository as ApiRepository<InclusionSubset<RepositoryIncludes, I>>;
  if (field in r) {
    return true;
  }
  return false;
};
