import {
  type DetailEntityType,
  type Experience,
  type Education,
  type Detail,
  type NestedDetail,
  type Project,
} from "./core";
import { type ConditionallyInclude } from "./inclusion";
import { type ApiProject } from "./project";
import { type ApiSkill } from "./skills";

export type DetailEntity<T extends DetailEntityType> = {
  readonly [DetailEntityType.EXPERIENCE]: Experience;
  readonly [DetailEntityType.EDUCATION]: Education;
}[T];

export type NestedDetailIncludes = ["skills"] | [];

export type NestedApiDetail<
  I extends NestedDetailIncludes = [],
  P extends Project = ApiProject<["skills"]>,
> = ConditionallyInclude<
  NestedDetail & {
    readonly project: P | null;
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

type ToNestedDetailIncludes<I extends DetailIncludes> = I extends
  | ["nestedDetails", "skills"]
  | ["skills", "nestedDetails"]
  | ["skills"]
  ? ["skills"]
  : [];

export type ApiDetail<
  I extends DetailIncludes = [],
  P extends Project = ApiProject<["skills"]>,
> = ConditionallyInclude<
  Detail & {
    readonly project: P | null;
    readonly skills: Omit<ApiSkill, "autoExperience">[];
    readonly nestedDetails: NestedApiDetail<ToNestedDetailIncludes<I>, P>[];
  },
  ["skills", "nestedDetails"],
  I
>;

export const isNestedDetail = <
  I extends DetailIncludes,
  N extends NestedDetailIncludes,
  P extends Project,
>(
  detail: ApiDetail<I, P> | NestedApiDetail<N, P>,
): detail is NestedApiDetail<N, P> => (detail as NestedApiDetail).detailId !== undefined;
