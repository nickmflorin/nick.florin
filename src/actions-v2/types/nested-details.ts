import { z } from "zod";

import {
  type NestedDetailIncludes,
  type NestedDetailIncludesField,
  NestedDetailIncludesFields,
} from "~/database/model";
import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import type { ActionVisibility } from "~/actions-v2/visibility";
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

export type NestedDetailsFilters = {
  readonly visible: boolean | null;
  readonly skills: string[];
  readonly search: string;
};

export interface NestedDetailsControls<
  I extends NestedDetailIncludes = NestedDetailIncludes,
  F = NestedDetailsFilters,
> {
  readonly filters: Partial<F>;
  readonly ordering?: Ordering<NestedDetailOrderableField>;
  readonly page?: number;
  readonly includes: I;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
}

export type FlattenedNestedDetailsControls<
  I extends NestedDetailIncludes = NestedDetailIncludes,
  F extends NestedDetailsFilters = NestedDetailsFilters,
> = F &
  Ordering<NestedDetailOrderableField> & {
    readonly page?: number;
    readonly includes: I;
    readonly limit?: number;
    readonly visibility: ActionVisibility;
  };

export type NestedDetailControls<I extends NestedDetailIncludes = NestedDetailIncludes> = Pick<
  NestedDetailsControls<I>,
  "includes" | "visibility"
>;

export const NestedDetailsFiltersObj = Filters({
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
});

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
