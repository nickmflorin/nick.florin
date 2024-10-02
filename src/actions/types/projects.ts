import { z } from "zod";

import {
  type ProjectIncludes,
  ProjectIncludesFields,
  type ProjectIncludesField,
} from "~/database/model";
import { Filters, type FiltersValues } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import { type Controls, type FlattenedControls } from "./controls";

export const ProjectOrderableFields = [
  "name",
  "shortName",
  "slug",
  "createdAt",
  "updatedAt",
  "startDate",
] as const;

export type ProjectOrderableField = (typeof ProjectOrderableFields)[number];

export const ProjectsDefaultOrdering: Ordering<"startDate", "asc"> = {
  orderBy: "startDate",
  order: "asc",
} satisfies Ordering<ProjectOrderableField>;

type ProjectsMappedPrismaOrdering<
  F extends ProjectOrderableField = ProjectOrderableField,
  O extends Order = Order,
> = {
  readonly name: { name: O };
  readonly slug: { slug: O };
  readonly shortName: { shortName: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
  readonly startDate: { startDate: O };
}[F];

export const ProjectsOrderingMap = <O extends Order>(order: O) =>
  ({
    slug: { slug: order } as const,
    name: { name: order } as const,
    shortName: { shortName: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
    startDate: { startDate: order } as const,
  }) satisfies { [key in ProjectOrderableField]: ProjectsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getProjectsOrdering = <F extends ProjectOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | ProjectsMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof ProjectsDefaultOrdering>
)[] => {
  if (ordering) {
    const map = ProjectsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | ProjectsMappedPrismaOrdering<F, O>
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
        | ProjectsMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [ProjectsDefaultOrdering.orderBy]: ProjectsDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export const ProjectsFiltersObj = new Filters({
  highlighted: Filters.flag(),
  visible: Filters.flag(),
  search: Filters.search(),
  repositories: Filters.multiString({ typeguard: isUuid }),
  skills: Filters.multiString({ typeguard: isUuid }),
});

export type ProjectsFilters = FiltersValues<typeof ProjectsFiltersObj>;

export type ProjectsControls<I extends ProjectIncludes = ProjectIncludes> = Controls<
  I,
  ProjectsFilters,
  ProjectOrderableField
>;

export type FlattenedProjectsControls<I extends ProjectIncludes = ProjectIncludes> =
  FlattenedControls<I, ProjectsFilters, ProjectOrderableField>;

export type ProjectControls<I extends ProjectIncludes = ProjectIncludes> = Pick<
  ProjectsControls<I>,
  "includes" | "visibility"
>;

// Used for API Routes
export const ProjectIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === "string") {
    return (ProjectIncludesFields.contains(value)
      ? [value]
      : []) as ProjectIncludesField[] as ProjectIncludes;
  }
  return value.reduce(
    (prev, curr) => (ProjectIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as ProjectIncludesField[],
  ) as ProjectIncludes;
});
