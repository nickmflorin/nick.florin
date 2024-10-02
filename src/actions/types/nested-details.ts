import { z } from "zod";

import {
  type NestedDetailIncludes,
  type NestedDetailIncludesField,
  NestedDetailIncludesFields,
} from "~/database/model";
import { Filters, type FiltersValues } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import { type Controls, type FlattenedControls } from "./controls";
/*
Note: Currently, the ordering and filtering aspects of data manipulation for NestedDetails are not
used by the client (even though the fetch actions support them).  However, these are left here so
we can eventually incorporate a nested details table similarly to the other tables in the admin.
*/
export const NestedDetailOrderableFields = ["label", "createdAt", "updatedAt"] as const;

export type NestedDetailOrderableField = (typeof NestedDetailOrderableFields)[number];

export const NestedDetailsDefaultOrdering: Ordering<"createdAt", "desc"> = {
  orderBy: "createdAt",
  order: "desc",
} satisfies Ordering<NestedDetailOrderableField>;

type NestedDetailsMappedPrismaOrdering<
  F extends NestedDetailOrderableField = NestedDetailOrderableField,
  O extends Order = Order,
> = {
  readonly label: { label: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
}[F];

export const NestedDetailsOrderingMap = <O extends Order>(order: O) =>
  ({
    label: { label: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
  }) satisfies { [key in NestedDetailOrderableField]: NestedDetailsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getNestedDetailsOrdering = <F extends NestedDetailOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | NestedDetailsMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof NestedDetailsDefaultOrdering>
)[] => {
  if (ordering) {
    const map = NestedDetailsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | NestedDetailsMappedPrismaOrdering<F, O>
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
        | NestedDetailsMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [NestedDetailsDefaultOrdering.orderBy]: NestedDetailsDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export const NestedDetailsFiltersObj = new Filters({
  visible: Filters.flag(),
  search: Filters.search(),
  skills: Filters.multiString({ typeguard: isUuid }),
});

export type NestedDetailsFilters = FiltersValues<typeof NestedDetailsFiltersObj>;

export type NestedDetailsControls<
  I extends NestedDetailIncludes = NestedDetailIncludes,
  F extends NestedDetailsFilters = NestedDetailsFilters,
> = Controls<I, F, NestedDetailOrderableField>;

export type FlattenedNestedDetailsControls<
  I extends NestedDetailIncludes = NestedDetailIncludes,
  F extends NestedDetailsFilters = NestedDetailsFilters,
> = FlattenedControls<I, F, NestedDetailOrderableField>;

export type NestedDetailControls<I extends NestedDetailIncludes = NestedDetailIncludes> = Pick<
  NestedDetailsControls<I>,
  "includes" | "visibility"
>;

// Used for API Routes
export const NestedDetailIncludesSchema = z
  .union([z.string(), z.array(z.string())])
  .transform(value => {
    if (typeof value === "string") {
      return (NestedDetailIncludesFields.contains(value)
        ? [value]
        : []) as NestedDetailIncludesField[] as NestedDetailIncludes;
    }
    return value.reduce(
      (prev, curr) => (NestedDetailIncludesFields.contains(curr) ? [...prev, curr] : prev),
      [] as NestedDetailIncludesField[],
    ) as NestedDetailIncludes;
  });
