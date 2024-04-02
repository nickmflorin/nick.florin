import {
  type DetailEntityType,
  type Experience,
  type Education,
  type Detail,
  type NestedDetail,
  type Project,
} from "./core";
import { type ConditionallyIncluded } from "./inclusion";

import { type ApiSkill } from ".";

export type DetailEntity<T extends DetailEntityType> = {
  readonly [DetailEntityType.EXPERIENCE]: Experience;
  readonly [DetailEntityType.EDUCATION]: Education;
}[T];

export type NestedDetailIncludes = Partial<{
  readonly skills: boolean;
}>;

export type NestedApiDetail<I extends NestedDetailIncludes = { skills: false }> =
  ConditionallyIncluded<
    NestedDetail & {
      readonly project: Project | null;
    },
    { skills: Omit<ApiSkill, "autoExperience">[] },
    I
  >;

export type DetailIncludes = Partial<{
  readonly skills: boolean;
  readonly nestedDetails: boolean;
}>;

export type ApiDetail<I extends DetailIncludes = { skills: false; nestedDetails: false }> =
  ConditionallyIncluded<
    Detail & {
      readonly project: Project | null;
    },
    { skills: Omit<ApiSkill, "autoExperience">[]; nestedDetails: NestedApiDetail<I>[] },
    I
  >;

export const isNestedDetail = <I extends DetailIncludes>(
  detail: ApiDetail<I> | NestedApiDetail<I>,
): detail is NestedApiDetail<I> => (detail as NestedApiDetail).detailId !== undefined;
