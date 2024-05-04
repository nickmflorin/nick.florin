import { type BrandModel } from "./brand";
import { type ApiDetail } from "./details";
import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

export type ExperienceIncludes =
  | ["skills", "details"]
  | ["details", "skills"]
  | ["skills"]
  | ["details"]
  | [];

export type ExperienceToDetailIncludes<I extends ExperienceIncludes> = I extends [
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  ...infer L extends string[],
  "skills",
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  ...infer R extends string[],
]
  ? ["nestedDetails", "skills"]
  : ["nestedDetails"];

export type ApiExperience<I extends ExperienceIncludes = []> = ConditionallyInclude<
  BrandModel<"experience"> & {
    readonly details: ApiDetail<ExperienceToDetailIncludes<I>>[];
    readonly skills: ApiSkill[];
  },
  ["skills", "details"],
  I
>;
