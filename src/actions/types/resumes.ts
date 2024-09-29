import { z } from "zod";

import { Filters } from "~/lib/filters";
import { type Order, type Ordering } from "~/lib/ordering";

import type { ActionVisibility } from "~/actions/visibility";

/*
Note: Currently, the ordering and filtering aspects of data manipulation for Resumes are not used
by the client (even though the fetch actions support them).  However, these are left here so we can
eventually incorporate a resumes table similarly to the other tables in the admin.
*/
export const ResumeOrderableFields = [
  "filename",
  "pathname",
  "createdAt",
  "updatedAt",
  "size",
] as const;

export type ResumeOrderableField = (typeof ResumeOrderableFields)[number];

export const ResumesDefaultOrdering = {
  orderBy: "createdAt",
  order: "desc",
} as const satisfies Ordering<ResumeOrderableField>;

type ResumesMappedPrismaOrdering<
  F extends ResumeOrderableField = ResumeOrderableField,
  O extends Order = Order,
> = {
  readonly filename: { filename: O };
  readonly pathname: { pathname: O };
  readonly createdAt: { createdAt: O };
  readonly updatedAt: { updatedAt: O };
  readonly size: { size: O };
}[F];

export const ResumesOrderingMap = <O extends Order>(order: O) =>
  ({
    filename: { filename: order } as const,
    pathname: { pathname: order } as const,
    createdAt: { createdAt: order } as const,
    updatedAt: { updatedAt: order } as const,
    size: { size: order } as const,
  }) satisfies { [key in ResumeOrderableField]: ResumesMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? { [key in F]: O }
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getResumesOrdering = <F extends ResumeOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | ResumesMappedPrismaOrdering<F, O>
  | PrismaOrdering<"id", "desc">
  | PrismaOrdering<"createdAt", "desc">
  | OrderingToPrisma<typeof ResumesDefaultOrdering>
)[] => {
  if (ordering) {
    const map = ResumesOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | ResumesMappedPrismaOrdering<F, O>
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
        | ResumesMappedPrismaOrdering<F, O>
        | PrismaOrdering<"id", "desc">
        | PrismaOrdering<"createdAt", "desc"> => v !== undefined,
    );
  }
  return [
    { [ResumesDefaultOrdering.orderBy]: ResumesDefaultOrdering.order },
    { createdAt: "desc" },
    { id: "desc" },
  ] as const;
};

export type ResumesFilters = {
  readonly search: string;
};

export type ResumesControls = {
  readonly filters: Partial<ResumesFilters>;
  readonly ordering?: Ordering<ResumeOrderableField>;
  readonly page?: number;
  readonly limit?: number;
  readonly visibility: ActionVisibility;
};

export type FlattenedResumesControls = Partial<ResumesFilters> &
  Partial<Ordering<ResumeOrderableField>> & {
    readonly page?: number;
    readonly limit?: number;
    readonly visibility: ActionVisibility;
  };

export type ResumeControls = Pick<ResumesControls, "visibility">;

export const ResumesFiltersObj = Filters({
  /* TODO: excludeWhen: v => v.trim() === "" -- This seems to not load table data when search is
     present in query params for initial URL but then is cleared. */
  search: { schema: z.string(), defaultValue: "" },
});
