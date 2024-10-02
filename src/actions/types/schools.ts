import { z } from "zod";

import {
  type SchoolIncludes,
  SchoolIncludesFields,
  type SchoolIncludesField,
} from "~/database/model";
import { arraysHaveSameElements } from "~/lib";
import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import { type FlattenedControls, type Controls } from "./controls";
/*
Note: Currently, the ordering and filtering aspects of data manipulation for Schools are not used
by the client (even though the fetch actions support them).  However, these are left here so we can
eventually incorporate a schools table similarly to the other tables in the admin.
*/
export const SchoolOrderableFields = [
  "name",
  "shortName",
  "createdAt",
  "updatedAt",
  "city",
  "state",
] as const;

export type SchoolOrderableField = (typeof SchoolOrderableFields)[number];

export const SchoolsDefaultOrdering: Ordering<"name", "desc"> = {
  orderBy: "name",
  order: "desc",
} satisfies Ordering<SchoolOrderableField>;

type SchoolsMappedPrismaOrdering<
  F extends SchoolOrderableField = SchoolOrderableField,
  O extends Order = Order,
> = {
  readonly name: { name: O };
  readonly shortName: { shortName: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
  readonly city: { city: O };
  readonly state: { state: O };
}[F];

export const SchoolsOrderingMap = <O extends Order>(order: O) =>
  ({
    name: { name: order } as const,
    shortName: { shortName: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
    city: { city: order } as const,
    state: { state: order } as const,
  }) satisfies { [key in SchoolOrderableField]: SchoolsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getSchoolsOrdering = <F extends SchoolOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | SchoolsMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof SchoolsDefaultOrdering>
)[] => {
  if (ordering) {
    const map = SchoolsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | SchoolsMappedPrismaOrdering<F, O>
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
        | SchoolsMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [SchoolsDefaultOrdering.orderBy]: SchoolsDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export type SchoolsFilters = {
  readonly search: string;
  readonly educations: string[];
};

export type SchoolsControls<I extends SchoolIncludes = SchoolIncludes> = Controls<
  I,
  SchoolsFilters,
  SchoolOrderableField
>;

export type FlattenedSchoolsControls<I extends SchoolIncludes = SchoolIncludes> = FlattenedControls<
  I,
  SchoolsFilters,
  SchoolOrderableField
>;

export type SchoolControls<I extends SchoolIncludes = SchoolIncludes> = Pick<
  SchoolsControls<I>,
  "includes" | "visibility"
>;

export const SchoolsFiltersObj = new Filters({
  /* TODO: excludeWhen: v => v.trim() === "" -- This seems to not load table data when search is
     present in query params for initial URL but then is cleared. */
  search: { schema: z.string(), defaultValue: "" },
  educations: {
    defaultValue: [] as string[],
    equals: arraysHaveSameElements,
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
export const SchoolIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === "string") {
    return (SchoolIncludesFields.contains(value)
      ? [value]
      : []) as SchoolIncludesField[] as SchoolIncludes;
  }
  return value.reduce(
    (prev, curr) => (SchoolIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as SchoolIncludesField[],
  ) as SchoolIncludes;
});
