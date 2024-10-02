import { z } from "zod";

import {
  type CourseIncludes,
  CourseIncludesFields,
  type CourseIncludesField,
} from "~/database/model";
import { arraysHaveSameElements } from "~/lib";
import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import { type FlattenedControls, type Controls } from "./controls";

export const CourseOrderableFields = [
  "name",
  "shortName",
  "slug",
  "createdAt",
  "updatedAt",
  "education",
] as const;

export type CourseOrderableField = (typeof CourseOrderableFields)[number];

export const CoursesDefaultOrdering: Ordering<"name", "desc"> = {
  orderBy: "name",
  order: "desc",
} satisfies Ordering<CourseOrderableField>;

type CoursesMappedPrismaOrdering<
  F extends CourseOrderableField = CourseOrderableField,
  O extends Order = Order,
> = {
  readonly name: { name: O };
  readonly shortName: { shortName: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
  readonly slug: { slug: O };
  readonly education: { education: { major: O } };
}[F];

export const CoursesOrderingMap = <O extends Order>(order: O) =>
  ({
    name: { name: order } as const,
    shortName: { shortName: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
    slug: { slug: order } as const,
    education: { education: { major: order } } as const,
  }) satisfies { [key in CourseOrderableField]: CoursesMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getCoursesOrdering = <F extends CourseOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | CoursesMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof CoursesDefaultOrdering>
)[] => {
  if (ordering) {
    const map = CoursesOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | CoursesMappedPrismaOrdering<F, O>
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
        | CoursesMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [CoursesDefaultOrdering.orderBy]: CoursesDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export type CoursesFilters = {
  readonly visible: boolean | null;
  readonly skills: string[];
  readonly search: string;
  readonly educations: string[];
};

export type CoursesControls<I extends CourseIncludes = CourseIncludes> = Controls<
  I,
  CoursesFilters,
  CourseOrderableField
>;

export type FlattenedCoursesControls<I extends CourseIncludes = CourseIncludes> = FlattenedControls<
  I,
  CoursesFilters,
  CourseOrderableField
>;

export type CourseControls<I extends CourseIncludes = CourseIncludes> = Pick<
  CoursesControls<I>,
  "includes" | "visibility"
>;

export const CoursesFiltersObj = new Filters({
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
    equals: arraysHaveSameElements,
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return isUuid(value) ? [value] : [];
      }
      return value.reduce((prev, curr) => (isUuid(curr) ? [...prev, curr] : prev), [] as string[]);
    }),
  },
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
export const CourseIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === "string") {
    return (CourseIncludesFields.contains(value)
      ? [value]
      : []) as CourseIncludesField[] as CourseIncludes;
  }
  return value.reduce(
    (prev, curr) => (CourseIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as CourseIncludesField[],
  ) as CourseIncludes;
});
