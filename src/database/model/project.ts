import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

import type { BrandDetail, BrandNestedDetail, BrandProject, BrandRepository } from "./brand";

import type { IconName, IconProp } from "~/components/icons";

import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

/* Even though these are populated in the database - we need to have a non-dynamic (i.e. hard-coded)
   list of project slugs to reference in UI logic. */
export const ProjectSlugs = enumeratedLiterals(
  [
    { value: "greenbudget", icon: "leaf" },
    { value: "asset-visualizations", icon: "chart-scatter-bubble" },
    { value: "website", icon: "passport" },
    { value: "tooltrack", icon: "screwdriver-wrench" },
  ] as const satisfies {
    readonly value: string;
    readonly icon: IconName | IconProp;
  }[],
  {},
);

export type ProjectSlug = EnumeratedLiteralsMember<typeof ProjectSlugs>;

export type ProjectIncludes =
  | ["skills", "repositories", "nestedDetails", "details"]
  | ["skills", "repositories", "details", "nestedDetails"]
  | ["skills", "nestedDetails", "repositories", "details"]
  | ["skills", "nestedDetails", "details", "repositories"]
  | ["skills", "details", "repositories", "nestedDetails"]
  | ["skills", "details", "nestedDetails", "repositories"]
  | ["repositories", "skills", "nestedDetails", "details"]
  | ["repositories", "skills", "details", "nestedDetails"]
  | ["repositories", "nestedDetails", "skills", "details"]
  | ["repositories", "nestedDetails", "details", "skills"]
  | ["repositories", "details", "skills", "nestedDetails"]
  | ["repositories", "details", "nestedDetails", "skills"]
  | ["nestedDetails", "skills", "repositories", "details"]
  | ["nestedDetails", "skills", "details", "repositories"]
  | ["nestedDetails", "repositories", "skills", "details"]
  | ["nestedDetails", "repositories", "details", "skills"]
  | ["nestedDetails", "details", "skills", "repositories"]
  | ["nestedDetails", "details", "repositories", "skills"]
  | ["details", "skills", "repositories", "nestedDetails"]
  | ["details", "skills", "nestedDetails", "repositories"]
  | ["details", "repositories", "skills", "nestedDetails"]
  | ["details", "repositories", "nestedDetails", "skills"]
  | ["details", "nestedDetails", "skills", "repositories"]
  | ["details", "nestedDetails", "repositories", "skills"]
  | ["skills", "repositories", "nestedDetails"]
  | ["skills", "repositories", "details"]
  | ["skills", "nestedDetails", "repositories"]
  | ["skills", "nestedDetails", "details"]
  | ["skills", "details", "repositories"]
  | ["skills", "details", "nestedDetails"]
  | ["repositories", "skills", "nestedDetails"]
  | ["repositories", "skills", "details"]
  | ["repositories", "nestedDetails", "skills"]
  | ["repositories", "nestedDetails", "details"]
  | ["repositories", "details", "skills"]
  | ["repositories", "details", "nestedDetails"]
  | ["nestedDetails", "skills", "repositories"]
  | ["nestedDetails", "skills", "details"]
  | ["nestedDetails", "repositories", "skills"]
  | ["nestedDetails", "repositories", "details"]
  | ["nestedDetails", "details", "skills"]
  | ["nestedDetails", "details", "repositories"]
  | ["details", "skills", "repositories"]
  | ["details", "skills", "nestedDetails"]
  | ["details", "repositories", "skills"]
  | ["details", "repositories", "nestedDetails"]
  | ["details", "nestedDetails", "skills"]
  | ["details", "nestedDetails", "repositories"]
  | ["skills", "repositories"]
  | ["skills", "nestedDetails"]
  | ["skills", "details"]
  | ["repositories", "skills"]
  | ["repositories", "nestedDetails"]
  | ["repositories", "details"]
  | ["nestedDetails", "skills"]
  | ["nestedDetails", "repositories"]
  | ["nestedDetails", "details"]
  | ["details", "skills"]
  | ["details", "repositories"]
  | ["details", "nestedDetails"]
  | ["skills"]
  | ["repositories"]
  | ["nestedDetails"]
  | ["details"]
  | [];

export type ApiProject<I extends ProjectIncludes = []> = ConditionallyInclude<
  BrandProject & {
    readonly skills: ApiSkill[];
    readonly repositories: BrandRepository[];
    readonly details: BrandDetail[];
    readonly nestedDetails: BrandNestedDetail[];
  },
  ["skills", "repositories", "details", "nestedDetails"],
  I
>;
