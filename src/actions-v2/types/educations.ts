import { z } from "zod";

import {
  type EducationIncludes,
  EducationIncludesFields,
  type EducationIncludesField,
  type Degree,
  Degrees,
} from "~/database/model";
import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import type { ActionVisibility } from "~/actions-v2/visibility";

export const EducationOrderableFields = [
  "major",
  "shortMajor",
  "createdAt",
  "updatedAt",
  "startDate",
  "endDate",
  "school",
] as const;

export type EducationOrderableField = (typeof EducationOrderableFields)[number];

export const EducationsDefaultOrdering: Ordering<"startDate", "desc"> = {
  orderBy: "startDate",
  order: "desc",
} satisfies Ordering<EducationOrderableField>;

type EducationsMappedPrismaOrdering<
  F extends EducationOrderableField = EducationOrderableField,
  O extends Order = Order,
> = {
  readonly major: { major: O };
  readonly shortMajor: { shortMajor: O };
  readonly startDate: { startDate: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
  readonly endDate: { endDate: O };
  readonly school: { school: { name: O } };
}[F];

export const EducationsOrderingMap = <O extends Order>(order: O) =>
  ({
    major: { major: order } as const,
    shortMajor: { shortMajor: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
    startDate: { startDate: order } as const,
    endDate: { endDate: order } as const,
    school: { school: { name: order } } as const,
  }) satisfies { [key in EducationOrderableField]: EducationsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getEducationsOrdering = <F extends EducationOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | EducationsMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof EducationsDefaultOrdering>
)[] => {
  if (ordering) {
    const map = EducationsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | EducationsMappedPrismaOrdering<F, O>
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
        | EducationsMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [EducationsDefaultOrdering.orderBy]: EducationsDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export interface EducationsFilters {
  readonly highlighted: boolean | null;
  readonly visible: boolean | null;
  readonly postPoned: boolean | null;
  readonly skills: string[];
  readonly search: string;
  readonly schools: string[];
  readonly courses: string[];
  readonly degrees: Degree[];
}

export interface EducationsControls<I extends EducationIncludes = EducationIncludes> {
  readonly filters: Partial<EducationsFilters>;
  readonly ordering?: Ordering<EducationOrderableField>;
  readonly page?: number;
  readonly includes: I;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
}

export type FlattenedEducationsControls<I extends EducationIncludes = EducationIncludes> =
  EducationsFilters &
    Ordering<EducationOrderableField> & {
      readonly page?: number;
      readonly includes: I;
      readonly limit?: number;
      readonly visibility: ActionVisibility;
    };

export type EducationControls<I extends EducationIncludes = EducationIncludes> = Pick<
  EducationsControls<I>,
  "includes" | "visibility"
>;

export const EducationsFiltersObj = Filters({
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
  postPoned: {
    schema: z.union([z.coerce.boolean(), z.null()]),
    defaultValue: null,
    excludeWhen: v => v === null,
  },
  /* TODO: excludeWhen: v => v.trim() === "" -- This seems to not load table data when search is
     present in query params for initial URL but then is cleared. */
  search: { schema: z.string(), defaultValue: "" },
  courses: {
    defaultValue: [] as string[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return isUuid(value) ? [value] : [];
      }
      return value.reduce((prev, curr) => (isUuid(curr) ? [...prev, curr] : prev), [] as string[]);
    }),
  },
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
  schools: {
    defaultValue: [] as string[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return isUuid(value) ? [value] : [];
      }
      return value.reduce((prev, curr) => (isUuid(curr) ? [...prev, curr] : prev), [] as string[]);
    }),
  },
  degrees: {
    defaultValue: [] as Degree[],
    excludeWhen: v => v.length === 0,
    schema: z.union([z.string(), z.array(z.string())]).transform(value => {
      if (typeof value === "string") {
        return Degrees.contains(value) ? [value] : [];
      }
      return value.reduce(
        (prev, curr) => (Degrees.contains(curr) ? [...prev, curr] : prev),
        [] as Degree[],
      );
    }),
  },
});

// Used for API Routes
export const EducationIncludesSchema = z
  .union([z.string(), z.array(z.string())])
  .transform(value => {
    if (typeof value === "string") {
      return (EducationIncludesFields.contains(value)
        ? [value]
        : []) as EducationIncludesField[] as EducationIncludes;
    }
    return value.reduce(
      (prev, curr) => (EducationIncludesFields.contains(curr) ? [...prev, curr] : prev),
      [] as EducationIncludesField[],
    ) as EducationIncludes;
  });
