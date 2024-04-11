import { environment } from "~/environment";

import { type BrandProject, type BrandRepository } from "./brand";
import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

export const getRepositoryGithubUrl = (repository: BrandRepository): string => {
  let basePath = environment.get("NEXT_PUBLIC_GITHUB_PROFILE_PREFIX");
  if (!basePath.endsWith("/")) {
    basePath = `${basePath}/`;
  }
  return `${basePath}${repository.slug}`;
};

export type RepositoryIncludes =
  | ["skills", "projects"]
  | ["projects", "skills"]
  | ["projects"]
  | ["skills"]
  | [];

export type ApiRepository<I extends RepositoryIncludes = []> = ConditionallyInclude<
  BrandRepository & {
    readonly skills: Omit<ApiSkill, "autoExperience">[];
    readonly projects: BrandProject[];
  },
  ["skills", "projects"],
  I
>;
