import { z } from "zod";

import {
  type ProjectIncludes,
  ProjectIncludeFields,
  type ProjectIncludesField,
} from "~/database/model";
import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import type { ActionVisibility } from "~/actions-v2/visibility";

export const ProjectOrderableFields = [
  "name",
  "shortName",
  "slug",
  "createdAt",
  "updatedAt",
  "startDate",
] as const;

export type ProjectOrderableField = (typeof ProjectOrderableFields)[number];

export const ProjectsDefaultOrdering: Ordering<"startDate"> = {
  orderBy: "startDate",
  order: "asc",
};

export const ProjectsOrderingMap = {
  name: order => [{ name: order }] as const,
  slug: order => [{ slug: order }] as const,
  shortName: order => [{ shortName: order }] as const,
  updatedAt: order => [{ updatedAt: order }] as const,
  createdAt: order => [{ createdAt: order }] as const,
  startDate: order => [{ startDate: order }] as const,
} as const satisfies { [key in ProjectOrderableField]: (order: Order) => unknown[] };

type PrismaOrdering<F extends string> = F extends string ? { [key in F]: Order } : never;

export const getProjectsOrdering = (
  ordering?: Ordering<ProjectOrderableField>,
): PrismaOrdering<ProjectOrderableField | "id">[] => {
  if (ordering) {
    return [
      ...ProjectsOrderingMap[ordering.orderBy](ordering.order),
      ordering.orderBy !== "createdAt" ? { createdAt: "desc" } : undefined,
      { id: "desc" },
    ].filter((v): v is PrismaOrdering<ProjectOrderableField | "id"> => v !== undefined);
  }
  return [
    { [ProjectsDefaultOrdering.orderBy]: ProjectsDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export interface ProjectsFilters {
  readonly highlighted: boolean | null;
  readonly visible: boolean | null;
  readonly search: string;
  readonly repositories: string[];
  readonly skills: string[];
}

export interface ProjectsControls<I extends ProjectIncludes = ProjectIncludes> {
  readonly filters: Partial<ProjectsFilters>;
  readonly ordering?: Ordering<ProjectOrderableField>;
  readonly page?: number;
  readonly includes: I;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
}

export type FlattenedProjectsControls<I extends ProjectIncludes = ProjectIncludes> =
  ProjectsFilters &
    Ordering<ProjectOrderableField> & {
      readonly page?: number;
      readonly includes: I;
      readonly limit?: number;
      readonly visibility: ActionVisibility;
    };

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
    return (ProjectIncludeFields.contains(value)
      ? [value]
      : []) as ProjectIncludesField[] as ProjectIncludes;
  }
  return value.reduce(
    (prev, curr) => (ProjectIncludeFields.contains(curr) ? [...prev, curr] : prev),
    [] as ProjectIncludesField[],
  ) as ProjectIncludes;
});
