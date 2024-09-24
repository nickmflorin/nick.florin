import { z } from "zod";

import {
  type ExperienceIncludes,
  ExperienceIncludesFields,
  type ExperienceIncludesField,
} from "~/database/model";
import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import type { ActionVisibility } from "~/actions-v2/visibility";

export const ExperienceOrderableFields = [
  "title",
  "shortTitle",
  "createdAt",
  "updatedAt",
  "startDate",
  "endDate",
  "company",
] as const;

export type ExperienceOrderableField = (typeof ExperienceOrderableFields)[number];

export const ExperiencesDefaultOrdering: Ordering<"startDate"> = {
  orderBy: "startDate",
  order: "desc",
};

export const ExperiencesOrderingMap = {
  title: order => [{ title: order }] as const,
  shortTitle: order => [{ shortTitle: order }] as const,
  createdAt: order => [{ createdAt: order }] as const,
  updatedAt: order => [{ updatedAt: order }] as const,
  startDate: order => [{ startDate: order }] as const,
  endDate: order => [{ endDate: order }] as const,
  company: order => [{ company: { name: order } }] as const,
} as const satisfies { [key in ExperienceOrderableField]: (order: Order) => unknown[] };

export interface ExperiencesFilters {
  readonly highlighted: boolean | null;
  readonly visible: boolean | null;
  readonly skills: string[];
  readonly search: string;
  readonly companies: string[];
}

export interface ExperiencesControls<I extends ExperienceIncludes = ExperienceIncludes> {
  readonly filters: Partial<ExperiencesFilters>;
  readonly ordering?: Ordering<ExperienceOrderableField>;
  readonly page?: number;
  readonly includes: I;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
}

export type FlattenedExperiencesControls<I extends ExperienceIncludes = ExperienceIncludes> =
  ExperiencesFilters &
    Ordering<ExperienceOrderableField> & {
      readonly page?: number;
      readonly includes: I;
      readonly limit?: number;
      readonly visibility: ActionVisibility;
    };

export const ExperiencesFiltersObj = Filters({
  highlighted: {
    schema: z.union([z.coerce.boolean(), z.null()]),
    defaultValue: null,
    excludeWhen: v => v === null,
  },
  visible: {
    schema: z.union([z.coerce.boolean(), z.null()]),
    defaultValue: null,
    excludeWhen: v => v === null,
  },
  search: { schema: z.string(), defaultValue: "", excludeWhen: (v: string) => v.length === 0 },
  skills: {
    defaultValue: [] as string[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return isUuid(value) ? [value] : [];
      }
      return value.reduce((prev, curr) => (isUuid(curr) ? [...prev, curr] : prev), [] as string[]);
    }),
  },
  companies: {
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
export const ExperienceIncludesSchema = z
  .union([z.string(), z.array(z.string())])
  .transform(value => {
    if (typeof value === "string") {
      return (ExperienceIncludesFields.contains(value)
        ? [value]
        : []) as ExperienceIncludesField[] as ExperienceIncludes;
    }
    return value.reduce(
      (prev, curr) => (ExperienceIncludesFields.contains(curr) ? [...prev, curr] : prev),
      [] as ExperienceIncludesField[],
    ) as ExperienceIncludes;
  });
