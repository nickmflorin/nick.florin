import { z } from "zod";

import {
  type EducationIncludes,
  EducationIncludesFields,
  type EducationIncludesField,
  type Degree,
  Degrees,
} from "~/database/model";
import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import type { ActionVisibility } from "~/actions-v2/visibility";

export const EducationOrderableFields = [
  "major",
  "shortMajor",
  "createdAt",
  "updatedAt",
  "startDate",
  "endDate",
  "school",
] as const;

export type EducationOrderableField = (typeof EducationOrderableFields)[number];

export const EducationsDefaultOrdering: Ordering<"startDate"> = {
  orderBy: "startDate",
  order: "desc",
};

export const EducationsOrderingMap = {
  major: order => [{ major: order }] as const,
  shortMajor: order => [{ shortMajor: order }] as const,
  createdAt: order => [{ createdAt: order }] as const,
  updatedAt: order => [{ updatedAt: order }] as const,
  startDate: order => [{ startDate: order }] as const,
  endDate: order => [{ endDate: order }] as const,
  school: order => [{ school: { name: order } }] as const,
} as const satisfies { [key in EducationOrderableField]: (order: Order) => unknown[] };

export interface EducationsFilters {
  readonly highlighted: boolean | null;
  readonly visible: boolean | null;
  readonly postPoned: boolean | null;
  readonly skills: string[];
  readonly search: string;
  readonly schools: string[];
  readonly courses: string[];
  readonly degrees: Degree[];
}

export interface EducationsControls<I extends EducationIncludes = EducationIncludes> {
  readonly filters: Partial<EducationsFilters>;
  readonly ordering?: Ordering<EducationOrderableField>;
  readonly page?: number;
  readonly includes: I;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
}

export type FlattenedEducationsControls<I extends EducationIncludes = EducationIncludes> =
  EducationsFilters &
    Ordering<EducationOrderableField> & {
      readonly page?: number;
      readonly includes: I;
      readonly limit?: number;
      readonly visibility: ActionVisibility;
    };

export const EducationsFiltersObj = Filters({
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
  postPoned: {
    schema: z.union([z.coerce.boolean(), z.null()]),
    defaultValue: null,
    excludeWhen: v => v === null,
  },
  search: { schema: z.string(), defaultValue: "", excludeWhen: (v: string) => v.length === 0 },
  courses: {
    defaultValue: [] as string[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return isUuid(value) ? [value] : [];
      }
      return value.reduce((prev, curr) => (isUuid(curr) ? [...prev, curr] : prev), [] as string[]);
    }),
  },
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
  schools: {
    defaultValue: [] as string[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return isUuid(value) ? [value] : [];
      }
      return value.reduce((prev, curr) => (isUuid(curr) ? [...prev, curr] : prev), [] as string[]);
    }),
  },
  degrees: {
    defaultValue: [] as Degree[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return Degrees.contains(value) ? [value] : [];
      }
      return value.reduce(
        (prev, curr) => (Degrees.contains(curr) ? [...prev, curr] : prev),
        [] as Degree[],
      );
    }),
  },
});

// Used for API Routes
export const EducationIncludesSchema = z
  .union([z.string(), z.array(z.string())])
  .transform(value => {
    if (typeof value === "string") {
      return (EducationIncludesFields.contains(value)
        ? [value]
        : []) as EducationIncludesField[] as EducationIncludes;
    }
    return value.reduce(
      (prev, curr) => (EducationIncludesFields.contains(curr) ? [...prev, curr] : prev),
      [] as EducationIncludesField[],
    ) as EducationIncludes;
  });
