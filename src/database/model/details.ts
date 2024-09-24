import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

import type { BrandNestedDetail, BrandDetail, BrandEducation, BrandExperience } from "./brand";

import { DetailEntityType } from "./generated";
import { type ConditionallyInclude } from "./inclusion";
import { type ApiProject } from "./project";
import { type ApiSkill } from "./skills";

export const DetailEntityTypes = enumeratedLiterals(
  [
    { value: DetailEntityType.EDUCATION, label: "Education" },
    { value: DetailEntityType.EXPERIENCE, label: "Experience" },
  ] as const satisfies {
    value: DetailEntityType;
    label: string;
  }[],
  {},
);

export type DetailEntity<T extends DetailEntityType> = {
  readonly [DetailEntityType.EXPERIENCE]: BrandExperience;
  readonly [DetailEntityType.EDUCATION]: BrandEducation;
}[T];

export type NestedDetailIncludes = ["skills"] | [];

export type NestedApiDetail<I extends NestedDetailIncludes = []> = ConditionallyInclude<
  BrandNestedDetail & {
    readonly project: ApiProject<I> | null;
    readonly skills: ApiSkill[];
  },
  ["skills"],
  I
>;

export const DetailIncludesFields = enumeratedLiterals(["skills", "nestedDetails"] as const, {});
export type DetailIncludesField = EnumeratedLiteralsMember<typeof DetailIncludesFields>;

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
  BrandDetail & {
    readonly project: ApiProject<ToSkillIncludes<I>> | null;
    readonly skills: ApiSkill[];
    readonly nestedDetails: NestedApiDetail<ToSkillIncludes<I>>[];
  },
  ["skills", "nestedDetails"],
  I
>;

export const isNestedDetail = <I extends DetailIncludes, N extends NestedDetailIncludes>(
  detail: ApiDetail<I> | NestedApiDetail<N>,
): detail is NestedApiDetail<N> => (detail as NestedApiDetail).detailId !== undefined;
