import type { BrandCourse } from "./brand";

import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

export type CourseIncludes = ["skills"] | [];

export type ApiCourse<I extends CourseIncludes = []> = ConditionallyInclude<
  BrandCourse & {
    readonly skills: Omit<ApiSkill, "autoExperience">[];
  },
  ["skills"],
  I
>;
