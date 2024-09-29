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

export const DetailsDefaultOrdering: Ordering<"createdAt", "desc"> = {
  orderBy: "createdAt",
  order: "desc",
} satisfies Ordering<DetailOrderableField>;

type DetailsMappedPrismaOrdering<
  F extends DetailOrderableField = DetailOrderableField,
  O extends Order = Order,
> = {
  readonly label: { label: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
  readonly project: { project: { name: O } };
}[F];

export const DetailsOrderingMap = <O extends Order>(order: O) =>
  ({
    label: { label: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
    project: { project: { name: order } } as const,
  }) satisfies { [key in DetailOrderableField]: DetailsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getDetailsOrdering = <F extends DetailOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | DetailsMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof DetailsDefaultOrdering>
)[] => {
  if (ordering) {
    const map = DetailsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | DetailsMappedPrismaOrdering<F, O>
      | PrismaOrdering<"id", "desc">
      | PrismaOrdering<"createdAt", "desc">
      | undefined
    )[] = [
      map,
      ordering.orderBy !== "createdAt" ? { createdAt: "desc" } : undefined,
      { id: "desc" },
    ];
    return arr.filter(
      (
        v,
      ): v is
        | DetailsMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [DetailsDefaultOrdering.orderBy]: DetailsDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export type DetailsFilters = {
  readonly entityIds: string[];
  readonly visible: boolean | null;
  readonly skills: string[];
  readonly search: string;
  readonly entityTypes: DetailEntityType[];
};

export interface DetailsControls<I extends DetailIncludes = DetailIncludes, F = DetailsFilters> {
  readonly filters: Partial<F>;
  readonly ordering?: Ordering<DetailOrderableField>;
  readonly page?: number;
  readonly includes: I;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
}

export type FlattenedDetailsControls<
  I extends DetailIncludes = DetailIncludes,
  F extends DetailsFilters = DetailsFilters,
> = F &
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
  /* TODO: excludeWhen: v => v.trim() === "" -- This seems to not load table data when search is
     present in query params for initial URL but then is cleared. */
  search: { schema: z.string(), defaultValue: "" },
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
