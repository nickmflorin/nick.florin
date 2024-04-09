import type { BrandProject, BrandRepository } from "./brand";

import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

export type ProjectIncludes =
  | ["repositories", "skills"]
  | ["skills", "repositories"]
  | ["repositories"]
  | ["skills"]
  | [];

export type ApiProject<I extends ProjectIncludes = []> = ConditionallyInclude<
  BrandProject & {
    readonly skills: Omit<ApiSkill, "autoExperience">[];
    readonly repositories: BrandRepository[];
  },
  ["skills", "repositories"],
  I
>;
