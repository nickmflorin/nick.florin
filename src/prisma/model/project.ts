import type { BrandProject } from "./brand";

import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

export type ProjectIncludes = ["skills"] | [];

export type ApiProject<I extends ProjectIncludes = []> = ConditionallyInclude<
  BrandProject & {
    readonly skills: Omit<ApiSkill, "autoExperience">[];
  },
  ["skills"],
  I
>;
