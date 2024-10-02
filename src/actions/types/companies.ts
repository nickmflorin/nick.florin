import { z } from "zod";

import type { FlattenedControls, Controls } from "./controls";

import {
  type CompanyIncludes,
  CompanyIncludesFields,
  type CompanyIncludesField,
} from "~/database/model";
import { Filters, type FiltersValues } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";
/*
Note: Currently, the ordering and filtering aspects of data manipulation for Companies are not used
by the client (even though the fetch actions support them).  However, these are left here so we can
eventually incorporate a companies table similarly to the other tables in the admin.
*/
export const CompanyOrderableFields = [
  "name",
  "shortName",
  "createdAt",
  "updatedAt",
  "city",
  "state",
] as const;

export type CompanyOrderableField = (typeof CompanyOrderableFields)[number];

export const CompaniesDefaultOrdering: Ordering<"name", "desc"> = {
  orderBy: "name",
  order: "desc",
} satisfies Ordering<CompanyOrderableField>;

type CompaniesMappedPrismaOrdering<
  F extends CompanyOrderableField = CompanyOrderableField,
  O extends Order = Order,
> = {
  readonly name: { name: O };
  readonly shortName: { shortName: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
  readonly city: { city: O };
  readonly state: { state: O };
}[F];

export const CompaniesOrderingMap = <O extends Order>(order: O) =>
  ({
    name: { name: order } as const,
    shortName: { shortName: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
    city: { city: order } as const,
    state: { state: order } as const,
  }) satisfies { [key in CompanyOrderableField]: CompaniesMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getCompaniesOrdering = <F extends CompanyOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | CompaniesMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof CompaniesDefaultOrdering>
)[] => {
  if (ordering) {
    const map = CompaniesOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | CompaniesMappedPrismaOrdering<F, O>
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
        | CompaniesMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [CompaniesDefaultOrdering.orderBy]: CompaniesDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export const CompaniesFiltersObj = new Filters({
  search: Filters.search(),
  experiences: Filters.multiString({ typeguard: isUuid }),
});

export type CompaniesFilters = FiltersValues<typeof CompaniesFiltersObj>;

export type CompaniesControls<I extends CompanyIncludes = CompanyIncludes> = Controls<
  I,
  CompaniesFilters,
  CompanyOrderableField
>;

export type FlattenedCompaniesControls<I extends CompanyIncludes = CompanyIncludes> =
  FlattenedControls<I, CompaniesFilters, CompanyOrderableField>;

export type CompanyControls<I extends CompanyIncludes = CompanyIncludes> = Pick<
  CompaniesControls<I>,
  "includes" | "visibility"
>;

// Used for API Routes
export const CompanyIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === "string") {
    return (CompanyIncludesFields.contains(value)
      ? [value]
      : []) as CompanyIncludesField[] as CompanyIncludes;
  }
  return value.reduce(
    (prev, curr) => (CompanyIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as CompanyIncludesField[],
  ) as CompanyIncludes;
});
