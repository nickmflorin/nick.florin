import { z } from "zod";

import {
  type SkillIncludes,
  SkillIncludesFields,
  type SkillIncludesField,
  SkillCategories,
  ProgrammingDomains,
  ProgrammingLanguages,
} from "~/database/model";
import { Filters, type FiltersValues } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import { type FlattenedControls, type Controls } from "./controls";

export const SkillOrderableFields = [
  "label",
  "slug",
  "createdAt",
  "updatedAt",
  "calculatedExperience",
] as const;

export type SkillOrderableField = (typeof SkillOrderableFields)[number];

export const SkillsDefaultOrdering: Ordering<"label", "asc"> = {
  orderBy: "label",
  order: "asc",
} satisfies Ordering<SkillOrderableField>;

type SkillsMappedPrismaOrdering<
  F extends SkillOrderableField = SkillOrderableField,
  O extends Order = Order,
> = {
  readonly slug: { slug: O };
  readonly label: { label: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
  readonly calculatedExperience: { calculatedExperience: O };
}[F];

export const SkillsOrderingMap = <O extends Order>(order: O) =>
  ({
    slug: { slug: order } as const,
    label: { label: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
    calculatedExperience: { calculatedExperience: order } as const,
  }) satisfies { [key in SkillOrderableField]: SkillsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getSkillsOrdering = <F extends SkillOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | SkillsMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof SkillsDefaultOrdering>
)[] => {
  if (ordering) {
    const map = SkillsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | SkillsMappedPrismaOrdering<F, O>
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
        | SkillsMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [SkillsDefaultOrdering.orderBy]: SkillsDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export const SkillsFiltersObj = new Filters({
  prioritized: Filters.flag(),
  highlighted: Filters.flag(),
  visible: Filters.flag(),
  search: Filters.search(),
  categories: Filters.multiEnum(SkillCategories.contains),
  programmingDomains: Filters.multiEnum(ProgrammingDomains.contains),
  programmingLanguages: Filters.multiEnum(ProgrammingLanguages.contains),
  experiences: Filters.multiString({ typeguard: isUuid }),
  projects: Filters.multiString({ typeguard: isUuid }),
  repositories: Filters.multiString({ typeguard: isUuid }),
  educations: Filters.multiString({ typeguard: isUuid }),
});

export type SkillsFilters = FiltersValues<typeof SkillsFiltersObj>;

export type SkillsControls<I extends SkillIncludes = SkillIncludes> = Controls<
  I,
  SkillsFilters,
  SkillOrderableField
>;

export type FlattenedSkillsControls<I extends SkillIncludes = SkillIncludes> = FlattenedControls<
  I,
  SkillsFilters,
  SkillOrderableField
>;

export type SkillControls<I extends SkillIncludes = SkillIncludes> = Pick<
  SkillsControls<I>,
  "includes" | "visibility"
>;

// Used for API Routes
export const SkillIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === "string") {
    return (SkillIncludesFields.contains(value)
      ? [value]
      : []) as SkillIncludesField[] as SkillIncludes;
  }
  return value.reduce(
    (prev, curr) => (SkillIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as SkillIncludesField[],
  ) as SkillIncludes;
});
