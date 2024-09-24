import { z } from "zod";

import {
  type DetailEntityType,
  type DetailIncludes,
  DetailIncludesFields,
  type DetailIncludesField,
  DetailEntityTypes,
} from "~/database/model";
import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import type { ActionVisibility } from "~/actions-v2/visibility";

/*
Note: Currently, the ordering and filtering aspects of data manipulation for Details are not used
by the client (even though the fetch actions support them).  However, these are left here so we can
eventually incorporate a details table similarly to the other tables in the admin.
*/
export const DetailOrderableFields = ["label", "createdAt", "updatedAt", "project"] as const;

export type DetailOrderableField = (typeof DetailOrderableFields)[number];

export const DetailsDefaultOrdering: Ordering<"createdAt"> = {
  orderBy: "createdAt",
  order: "desc",
};

export const DetailsOrderingMap = {
  label: order => [{ label: order }] as const,
  createdAt: order => [{ createdAt: order }] as const,
  updatedAt: order => [{ updatedAt: order }] as const,
  project: order => [{ project: { name: order } }] as const,
} as const satisfies { [key in DetailOrderableField]: (order: Order) => unknown[] };

export interface DetailsFilters {
  readonly entityIds: string[];
  readonly visible: boolean | null;
  readonly skills: string[];
  readonly search: string;
  readonly entityTypes: DetailEntityType[];
}

export interface DetailsControls<I extends DetailIncludes = DetailIncludes> {
  readonly filters: Partial<DetailsFilters>;
  readonly ordering?: Ordering<DetailOrderableField>;
  readonly page?: number;
  readonly includes: I;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
}

export type FlattenedDetailsControls<I extends DetailIncludes = DetailIncludes> = DetailsFilters &
  Ordering<DetailOrderableField> & {
    readonly page?: number;
    readonly includes: I;
    readonly limit?: number;
    readonly visibility: ActionVisibility;
  };

export const DetailsFiltersObj = Filters({
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
  entityIds: {
    defaultValue: [] as string[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return isUuid(value) ? [value] : [];
      }
      return value.reduce((prev, curr) => (isUuid(curr) ? [...prev, curr] : prev), [] as string[]);
    }),
  },
  entityTypes: {
    defaultValue: [] as DetailEntityType[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return DetailEntityTypes.contains(value) ? [value] : [];
      }
      return value.reduce(
        (prev, curr) => (DetailEntityTypes.contains(curr) ? [...prev, curr] : prev),
        [] as DetailEntityType[],
      );
    }),
  },
});

// Used for API Routes
export const DetailIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === "string") {
    return (DetailIncludesFields.contains(value)
      ? [value]
      : []) as DetailIncludesField[] as DetailIncludes;
  }
  return value.reduce(
    (prev, curr) => (DetailIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as DetailIncludesField[],
  ) as DetailIncludes;
});
