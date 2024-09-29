import { z } from "zod";

import {
  type ProjectIncludes,
  ProjectIncludesFields,
  type ProjectIncludesField,
} from "~/database/model";
import { Filters } from "~/lib/filters";
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

export type ProjectsFilters = {
  readonly highlighted: boolean | null;
  readonly visible: boolean | null;
  readonly search: string;
  readonly repositories: string[];
  readonly skills: string[];
};

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

export const ProjectsFiltersObj = Filters({
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
  repositories: {
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
