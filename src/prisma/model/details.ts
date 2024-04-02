import {
  type DetailEntityType,
  type Experience,
  type Education,
  type Detail,
  type NestedDetail,
  type Project,
} from "./core";
import { type ConditionallyIncluded } from "./inclusion";
import { type ApiProject } from "./project";
import { type ApiSkill } from "./skills";

export type DetailEntity<T extends DetailEntityType> = {
  readonly [DetailEntityType.EXPERIENCE]: Experience;
  readonly [DetailEntityType.EDUCATION]: Education;
}[T];

export type NestedDetailIncludes = Partial<{
  readonly skills: boolean;
}>;

export type NestedApiDetail<
  I extends NestedDetailIncludes | null = { skills: false },
  P extends Project = ApiProject<{ skills: true }>,
> = ConditionallyIncluded<
  NestedDetail & {
    readonly project: P | null;
  },
  { skills: Omit<ApiSkill, "autoExperience">[] },
  I
>;

export type DetailIncludes = Partial<{
  readonly skills: boolean;
  readonly nestedDetails: boolean;
}>;

export type ApiDetail<
  I extends DetailIncludes | null = { skills: false; nestedDetails: false },
  P extends Project = ApiProject<{ skills: true }>,
> = ConditionallyIncluded<
  Detail & {
    readonly project: P | null;
  },
  { skills: Omit<ApiSkill, "autoExperience">[]; nestedDetails: NestedApiDetail<I, P>[] },
  I
>;

export const isNestedDetail = <I extends DetailIncludes>(
  detail: ApiDetail<I> | NestedApiDetail<I>,
): detail is NestedApiDetail<I> => (detail as NestedApiDetail).detailId !== undefined;
