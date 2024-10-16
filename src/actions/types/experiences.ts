import { z } from "zod";

import {
  type ExperienceIncludes,
  ExperienceIncludesFields,
  type ExperienceIncludesField,
} from "~/database/model";
import { Filters, type FiltersValues } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import { type Controls, type FlattenedControls } from "./controls";

export const ExperienceOrderableFields = [
  "title",
  "shortTitle",
  "createdAt",
  "updatedAt",
  "startDate",
  "endDate",
  "company",
] as const;

export type ExperienceOrderableField = (typeof ExperienceOrderableFields)[number];

export const ExperiencesDefaultOrdering: Ordering<"startDate", "desc"> = {
  orderBy: "startDate",
  order: "desc",
} satisfies Ordering<ExperienceOrderableField>;

type ExperiencesMappedPrismaOrdering<
  F extends ExperienceOrderableField = ExperienceOrderableField,
  O extends Order = Order,
> = {
  readonly title: { title: O };
  readonly shortTitle: { shortTitle: O };
  readonly startDate: { startDate: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
  readonly endDate: { endDate: O };
  readonly company: { company: { name: O } };
}[F];

export const ExperiencesOrderingMap = <O extends Order>(order: O) =>
  ({
    title: { title: order } as const,
    shortTitle: { shortTitle: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
    startDate: { startDate: order } as const,
    endDate: { endDate: order } as const,
    company: { company: { name: order } } as const,
  }) satisfies { [key in ExperienceOrderableField]: ExperiencesMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getExperiencesOrdering = <F extends ExperienceOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | ExperiencesMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof ExperiencesDefaultOrdering>
)[] => {
  if (ordering) {
    const map = ExperiencesOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | ExperiencesMappedPrismaOrdering<F, O>
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
        | ExperiencesMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [ExperiencesDefaultOrdering.orderBy]: ExperiencesDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export const ExperiencesFiltersObj = new Filters({
  highlighted: Filters.flag(),
  visible: Filters.flag(),
  search: Filters.search(),
  skills: Filters.multiString({ typeguard: isUuid }),
  companies: Filters.multiString({ typeguard: isUuid }),
});

export type ExperiencesFilters = FiltersValues<typeof ExperiencesFiltersObj>;

export type ExperiencesControls<I extends ExperienceIncludes = ExperienceIncludes> = Controls<
  I,
  ExperiencesFilters,
  ExperienceOrderableField
>;

export type FlattenedExperiencesControls<I extends ExperienceIncludes = ExperienceIncludes> =
  FlattenedControls<I, ExperiencesFilters, ExperienceOrderableField>;

export type ExperienceControls<I extends ExperienceIncludes = ExperienceIncludes> = Pick<
  ExperiencesControls<I>,
  "includes" | "visibility"
>;

// Used for API Routes
export const ExperienceIncludesSchema = z
  .union([z.string(), z.array(z.string())])
  .transform(value => {
    if (typeof value === "string") {
      return (ExperienceIncludesFields.contains(value)
        ? [value]
        : []) as ExperienceIncludesField[] as ExperienceIncludes;
    }
    return value.reduce(
      (prev, curr) => (ExperienceIncludesFields.contains(curr) ? [...prev, curr] : prev),
      [] as ExperienceIncludesField[],
    ) as ExperienceIncludes;
  });
