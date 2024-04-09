import type { BrandCourse, BrandEducation } from "./brand";

import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

export type CourseIncludes =
  | ["education", "skills"]
  | ["skills", "education"]
  | ["education"]
  | ["skills"]
  | [];

export type ApiCourse<I extends CourseIncludes = []> = ConditionallyInclude<
  BrandCourse & {
    readonly skills: Omit<ApiSkill, "autoExperience">[];
    readonly education: BrandEducation;
  },
  ["skills", "education"],
  I
>;
