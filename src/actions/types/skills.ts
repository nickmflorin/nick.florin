import { z } from "zod";

import {
  type SkillIncludes,
  SkillIncludesFields,
  type SkillIncludesField,
  SkillCategories,
  type ProgrammingDomain,
  type ProgrammingLanguage,
  type SkillCategory,
  ProgrammingDomains,
  ProgrammingLanguages,
} from "~/database/model";
import { arraysHaveSameElements } from "~/lib";
import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import type { ActionVisibility } from "~/actions/visibility";

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

export interface SkillsFilters {
  readonly highlighted: boolean | null;
  readonly prioritized: boolean | null;
  readonly visible: boolean | null;
  readonly experiences: string[];
  readonly educations: string[];
  readonly programmingDomains: ProgrammingDomain[];
  readonly programmingLanguages: ProgrammingLanguage[];
  readonly search: string;
  readonly categories: SkillCategory[];
  readonly projects: string[];
  readonly repositories: string[];
}

export interface SkillsControls<I extends SkillIncludes = SkillIncludes> {
  readonly filters: Partial<SkillsFilters>;
  readonly ordering?: Ordering<SkillOrderableField>;
  readonly page?: number;
  readonly includes: I;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
}

export type FlattenedSkillsControls<I extends SkillIncludes = SkillIncludes> = SkillsFilters &
  Ordering<SkillOrderableField> & {
    readonly page?: number;
    readonly includes: I;
    readonly limit?: number;
    readonly visibility: ActionVisibility;
  };

export type SkillControls<I extends SkillIncludes = SkillIncludes> = Pick<
  SkillsControls<I>,
  "includes" | "visibility"
>;

export const SkillsFiltersObj = Filters({
  highlighted: {
    schema: z.union([z.coerce.boolean(), z.null()]),
    defaultValue: null,
    excludeWhen: v => v === null,
  },
  prioritized: {
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
  categories: {
    defaultValue: [] as SkillCategory[],
    equals: arraysHaveSameElements,
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return SkillCategories.contains(value) ? [value] : [];
      }
      return value.reduce(
        (prev, curr) => (SkillCategories.contains(curr) ? [...prev, curr] : prev),
        [] as SkillCategory[],
      );
    }),
  },
  programmingDomains: {
    defaultValue: [] as ProgrammingDomain[],
    equals: arraysHaveSameElements,
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return ProgrammingDomains.contains(value) ? [value] : [];
      }
      return value.reduce(
        (prev, curr) => (ProgrammingDomains.contains(curr) ? [...prev, curr] : prev),
        [] as ProgrammingDomain[],
      );
    }),
  },
  programmingLanguages: {
    defaultValue: [] as ProgrammingLanguage[],
    equals: arraysHaveSameElements,
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return ProgrammingLanguages.contains(value) ? [value] : [];
      }
      return value.reduce(
        (prev, curr) => (ProgrammingLanguages.contains(curr) ? [...prev, curr] : prev),
        [] as ProgrammingLanguage[],
      );
    }),
  },
  experiences: {
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
  projects: {
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
  repositories: {
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
