import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

import type { BrandCourse, BrandEducation } from "./brand";

import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

export const CourseIncludesFields = enumeratedLiterals(["skills", "education"] as const, {});
export type CourseIncludesField = EnumeratedLiteralsMember<typeof CourseIncludesFields>;

export type CourseIncludes =
  | ["education", "skills"]
  | ["skills", "education"]
  | ["education"]
  | ["skills"]
  | [];

export type ApiCourse<I extends CourseIncludes = []> = ConditionallyInclude<
  BrandCourse & {
    readonly skills: ApiSkill[];
    readonly education: BrandEducation;
  },
  ["skills", "education"],
  I
>;
