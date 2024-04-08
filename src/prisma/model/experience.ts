import { type BrandModel } from "./brand";
import { type ApiDetail } from "./details";
import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

export type ExpIncludes =
  | ["skills", "details"]
  | ["details", "skills"]
  | ["skills"]
  | ["details"]
  | [];

export type ApiExperience<I extends ExpIncludes = []> = ConditionallyInclude<
  BrandModel<"experience"> & {
    readonly details: ApiDetail<["nestedDetails", "skills"]>[];
    readonly skills: Omit<ApiSkill, "autoExperience">[];
  },
  ["skills", "details"],
  I
>;
