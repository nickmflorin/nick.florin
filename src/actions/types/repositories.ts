import { z } from "zod";

import {
  type RepositoryIncludes,
  RepositoryIncludesFields,
  type RepositoryIncludesField,
} from "~/database/model";
import { type FiltersValues, Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import { type Controls, type FlattenedControls } from "./controls";

export const RepositoryOrderableFields = [
  "slug",
  "description",
  "startDate",
  "npmPackageName",
  "createdAt",
  "updatedAt",
] as const;

export type RepositoryOrderableField = (typeof RepositoryOrderableFields)[number];

export const RepositoriesDefaultOrdering: Ordering<"startDate", "desc"> = {
  orderBy: "startDate",
  order: "desc",
} satisfies Ordering<RepositoryOrderableField>;

type RepositoriesMappedPrismaOrdering<
  F extends RepositoryOrderableField = RepositoryOrderableField,
  O extends Order = Order,
> = {
  readonly slug: { slug: O };
  readonly description: { description: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
  readonly startDate: { startDate: O };
  readonly npmPackageName: { npmPackageName: O };
}[F];

export const RepositoriesOrderingMap = <O extends Order>(order: O) =>
  ({
    slug: { slug: order } as const,
    description: { description: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
    startDate: { startDate: order } as const,
    npmPackageName: { npmPackageName: order } as const,
  }) satisfies { [key in RepositoryOrderableField]: RepositoriesMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getRepositoriesOrdering = <F extends RepositoryOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | RepositoriesMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof RepositoriesDefaultOrdering>
)[] => {
  if (ordering) {
    const map = RepositoriesOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | RepositoriesMappedPrismaOrdering<F, O>
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
        | RepositoriesMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [RepositoriesDefaultOrdering.orderBy]: RepositoriesDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export const RepositoriesFiltersObj = new Filters({
  highlighted: Filters.flag(),
  visible: Filters.flag(),
  search: Filters.search(),
  projects: Filters.multiString({ typeguard: isUuid }),
  skills: Filters.multiString({ typeguard: isUuid }),
});

export type RepositoriesFilters = FiltersValues<typeof RepositoriesFiltersObj>;

export type RepositoriesControls<I extends RepositoryIncludes = RepositoryIncludes> = Controls<
  I,
  RepositoriesFilters,
  RepositoryOrderableField
>;

export type FlattenedRepositoriesControls<I extends RepositoryIncludes = RepositoryIncludes> =
  FlattenedControls<I, RepositoriesFilters, RepositoryOrderableField>;

export type RepositoryControls<I extends RepositoryIncludes = RepositoryIncludes> = Pick<
  RepositoriesControls<I>,
  "includes" | "visibility"
>;

// Used for API Routes
export const RepositoryIncludesSchema = z
  .union([z.string(), z.array(z.string())])
  .transform(value => {
    if (typeof value === "string") {
      return (RepositoryIncludesFields.contains(value)
        ? [value]
        : []) as RepositoryIncludesField[] as RepositoryIncludes;
    }
    return value.reduce(
      (prev, curr) => (RepositoryIncludesFields.contains(curr) ? [...prev, curr] : prev),
      [] as RepositoryIncludesField[],
    ) as RepositoryIncludes;
  });
