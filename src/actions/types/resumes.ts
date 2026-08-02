import { Filters, type FiltersValues } from '~/lib/filters';
import { type Order, type Ordering } from '~/lib/ordering';

import { type ActionVisibility } from '~/actions/visibility';

/*
Note: Currently, the ordering and filtering aspects of data manipulation for Resumes are not used
by the client (even though the fetch actions support them).  However, these are left here so we can
eventually incorporate a resumes table similarly to the other tables in the admin.
*/
export const ResumeOrderableFields = [
  'filename',
  'pathname',
  'createdAt',
  'updatedAt',
  'size',
] as const;

export type ResumeOrderableField = (typeof ResumeOrderableFields)[number];

export const ResumesDefaultOrdering = {
  order: 'desc',
  orderBy: 'createdAt',
} as const satisfies Ordering<ResumeOrderableField>;

type ResumesMappedPrismaOrdering<
  F extends ResumeOrderableField = ResumeOrderableField,
  O extends Order = Order,
> = {
  readonly createdAt: { createdAt: O };
  readonly filename: { filename: O };
  readonly pathname: { pathname: O };
  readonly size: { size: O };
  readonly updatedAt: { updatedAt: O };
}[F];

export const ResumesOrderingMap = <O extends Order>(order: O) =>
  ({
    createdAt: { createdAt: order } as const,
    filename: { filename: order } as const,
    pathname: { pathname: order } as const,
    size: { size: order } as const,
    updatedAt: { updatedAt: order } as const,
  }) satisfies { [key in ResumeOrderableField]: ResumesMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? Record<F, O>
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getResumesOrdering = <F extends ResumeOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | OrderingToPrisma<typeof ResumesDefaultOrdering>
  | PrismaOrdering<'id', 'desc'>
  | ResumesMappedPrismaOrdering<F, O>
)[] => {
  if (ordering) {
    const map = ResumesOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | PrismaOrdering<'createdAt', 'desc'>
      | PrismaOrdering<'id', 'desc'>
      | ResumesMappedPrismaOrdering<F, O>
      | undefined
    )[] = [
      map,
      ordering.orderBy === 'createdAt' ? undefined : { createdAt: 'desc' },
      { id: 'desc' },
    ];
    return arr.filter(
      (
        v,
      ): v is
        | PrismaOrdering<'createdAt', 'desc'>
        | PrismaOrdering<'id', 'desc'>
        | ResumesMappedPrismaOrdering<F, O> => v !== undefined,
    );
  }
  return [
    { [ResumesDefaultOrdering.orderBy]: ResumesDefaultOrdering.order },
    { createdAt: 'desc' },
    { id: 'desc' },
  ] as const;
};

export const ResumesFiltersObj = new Filters({
  search: Filters.search(),
});

export type ResumesFilters = FiltersValues<typeof ResumesFiltersObj>;

export type ResumesControls = {
  readonly filters: Partial<ResumesFilters>;
  readonly limit?: number;
  readonly ordering?: Ordering<ResumeOrderableField>;
  readonly page?: number;
  readonly visibility: ActionVisibility;
};

export type FlattenedResumesControls = {
  readonly limit?: number;
  readonly page?: number;
  readonly visibility: ActionVisibility;
} & Partial<Ordering<ResumeOrderableField>> &
  Partial<ResumesFilters>;

export type ResumeControls = Pick<ResumesControls, 'visibility'>;
