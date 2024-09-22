import { z } from "zod";

import {
  type SkillIncludes,
  SkillIncludesFields,
  type SkillIncludesField,
  SkillCategories,
} from "~/database/model";
import {
  ProgrammingDomain,
  ProgrammingLanguage,
  SkillCategory,
  ProgrammingDomains,
  ProgrammingLanguages,
} from "~/database/model";
import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import type { ActionVisibility } from "~/actions-v2/visibility";

export const SkillOrderableFields = [
  "label",
  "slug",
  "createdAt",
  "updatedAt",
  "calculatedExperience",
] as const;

export type SkillOrderableField = (typeof SkillOrderableFields)[number];

export const SkillsDefaultOrdering: Ordering<"label"> = {
  orderBy: "label",
  order: "asc",
};

export const SkillsOrderingMap = {
  label: order => [{ label: order }] as const,
  slug: order => [{ slug: order }] as const,
  createdAt: order => [{ createdAt: order }] as const,
  updatedAt: order => [{ updatedAt: order }] as const,
  calculatedExperience: order => [{ calculatedExperience: order }] as const,
} as const satisfies { [key in SkillOrderableField]: (order: Order) => unknown[] };

export const SkillsFiltersSchema = z.object({
  includeInTopSkills: z.boolean().nullable(),
  experiences: z.array(z.string().uuid()),
  educations: z.array(z.string().uuid()),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)),
  categories: z.array(z.nativeEnum(SkillCategory)),
  search: z.string(),
});

export type SkillsFilters = z.infer<typeof SkillsFiltersSchema>;

export const ShowTopSkillsSchema = z.union([
  z.literal(5),
  z.literal(8),
  z.literal(12),
  z.literal("all"),
]);
export type ShowTopSkills = z.infer<typeof ShowTopSkillsSchema>;

export type ShowTopSkillsString = `${ShowTopSkills}`;

export interface SkillsControls<I extends SkillIncludes = SkillIncludes> {
  readonly filters: Partial<SkillsFilters>;
  readonly ordering: Ordering<SkillOrderableField>;
  readonly page?: number;
  readonly includes: I;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
}

export const SkillsFiltersObj = Filters({
  includeInTopSkills: {
    schema: z.union([z.coerce.boolean(), z.null()]),
    defaultValue: null,
    excludeWhen: v => v === null,
  },
  search: { schema: z.string(), defaultValue: "", excludeWhen: (v: string) => v.length === 0 },
  categories: {
    defaultValue: [] as SkillCategory[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return SkillCategories.contains(value) ? [value] : [];
      }
      return value.reduce(
        (prev, curr) => (SkillCategories.contains(curr) ? [...prev, curr] : prev),
        [] as SkillCategory[],
      );
    }),
  },
  programmingDomains: {
    defaultValue: [] as ProgrammingDomain[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return ProgrammingDomains.contains(value) ? [value] : [];
      }
      return value.reduce(
        (prev, curr) => (ProgrammingDomains.contains(curr) ? [...prev, curr] : prev),
        [] as ProgrammingDomain[],
      );
    }),
  },
  programmingLanguages: {
    defaultValue: [] as ProgrammingLanguage[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return ProgrammingLanguages.contains(value) ? [value] : [];
      }
      return value.reduce(
        (prev, curr) => (ProgrammingLanguages.contains(curr) ? [...prev, curr] : prev),
        [] as ProgrammingLanguage[],
      );
    }),
  },
  experiences: {
    defaultValue: [] as string[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return isUuid(value) ? [value] : [];
      }
      return value.reduce((prev, curr) => (isUuid(curr) ? [...prev, curr] : prev), [] as string[]);
    }),
  },
  educations: {
    defaultValue: [] as string[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return isUuid(value) ? [value] : [];
      }
      return value.reduce((prev, curr) => (isUuid(curr) ? [...prev, curr] : prev), [] as string[]);
    }),
  },
});

// Used for API Routes
export const SkillIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === "string") {
    return (SkillIncludesFields.contains(value) ? [value] : []) as SkillIncludesField[];
  }
  return value.reduce(
    (prev, curr) => (SkillIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as SkillIncludesField[],
  ) as SkillIncludes;
});
