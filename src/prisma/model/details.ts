import {
  type DetailEntityType,
  type Experience,
  type Education,
  type Detail,
  type NestedDetail,
} from "./core";
import { type ConditionallyInclude } from "./inclusion";
import { type ApiProject } from "./project";
import { type ApiSkill } from "./skills";

export type DetailEntity<T extends DetailEntityType> = {
  readonly [DetailEntityType.EXPERIENCE]: Experience;
  readonly [DetailEntityType.EDUCATION]: Education;
}[T];

export type NestedDetailIncludes = ["skills"] | [];

export type NestedApiDetail<I extends NestedDetailIncludes = []> = ConditionallyInclude<
  NestedDetail & {
    readonly project: ApiProject<I> | null;
    readonly skills: Omit<ApiSkill, "autoExperience">[];
  },
  ["skills"],
  I
>;

export type DetailIncludes =
  | ["nestedDetails", "skills"]
  | ["skills", "nestedDetails"]
  | ["skills"]
  | ["nestedDetails"]
  | [];

export type ToSkillIncludes<I extends DetailIncludes> = I extends
  | ["nestedDetails", "skills"]
  | ["skills", "nestedDetails"]
  | ["skills"]
  ? ["skills"]
  : [];

export type ApiDetail<I extends DetailIncludes = []> = ConditionallyInclude<
  Detail & {
    readonly project: ApiProject<ToSkillIncludes<I>> | null;
    readonly skills: Omit<ApiSkill, "autoExperience">[];
    readonly nestedDetails: NestedApiDetail<ToSkillIncludes<I>>[];
  },
  ["skills", "nestedDetails"],
  I
>;

export const isNestedDetail = <I extends DetailIncludes, N extends NestedDetailIncludes>(
  detail: ApiDetail<I> | NestedApiDetail<N>,
): detail is NestedApiDetail<N> => (detail as NestedApiDetail).detailId !== undefined;
