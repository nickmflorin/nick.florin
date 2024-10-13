import { z } from "zod";

import {
  type EducationIncludes,
  EducationIncludesFields,
  type EducationIncludesField,
  Degrees,
} from "~/database/model";
import { Filters, type FiltersValues } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";
import { isUuid } from "~/lib/typeguards";

import { type FlattenedControls, type Controls } from "./controls";

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

export const EducationsFiltersObj = new Filters({
  postPoned: Filters.flag(),
  highlighted: Filters.flag(),
  visible: Filters.flag(),
  search: Filters.search(),
  degrees: Filters.multiEnum(Degrees.contains.bind(Degrees)),
  courses: Filters.multiString({ typeguard: isUuid }),
  skills: Filters.multiString({ typeguard: isUuid }),
  schools: Filters.multiString({ typeguard: isUuid }),
});

export type EducationsFilters = FiltersValues<typeof EducationsFiltersObj>;

export type EducationsControls<I extends EducationIncludes = EducationIncludes> = Controls<
  I,
  EducationsFilters,
  EducationOrderableField
>;

export type FlattenedEducationsControls<I extends EducationIncludes = EducationIncludes> =
  FlattenedControls<I, EducationsFilters, EducationOrderableField>;

export type EducationControls<I extends EducationIncludes = EducationIncludes> = Pick<
  EducationsControls<I>,
  "includes" | "visibility"
>;

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
