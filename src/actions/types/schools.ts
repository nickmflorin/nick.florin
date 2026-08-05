import { z } from 'zod';

import {
  type SchoolIncludes,
  type SchoolIncludesField,
  SchoolIncludesFields,
} from '~/database/model';
import { Filters, type FiltersValues } from '~/lib/filters';
import { type Order, type Ordering } from '~/lib/ordering';
import { isUuid } from '~/lib/typeguards';

import { type Controls, type FlattenedControls } from './controls';

/* Note: Currently, the ordering and filtering aspects of data manipulation for Schools are not used
   by the client (even though the fetch actions support them). However, these are left here so we
   can eventually incorporate a schools table similarly to the other tables in the admin. */
export const SchoolOrderableFields = [
  'name',
  'shortName',
  'createdAt',
  'updatedAt',
  'city',
  'state',
] as const;

export type SchoolOrderableField = (typeof SchoolOrderableFields)[number];

export const SchoolsDefaultOrdering: Ordering<'name', 'desc'> = {
  order: 'desc',
  orderBy: 'name',
} satisfies Ordering<SchoolOrderableField>;

type SchoolsMappedPrismaOrdering<
  F extends SchoolOrderableField = SchoolOrderableField,
  O extends Order = Order,
> = {
  readonly city: { city: O };
  readonly createdAt: { createdAt: O };
  readonly name: { name: O };
  readonly shortName: { shortName: O };
  readonly state: { state: O };
  readonly updatedAt: { updatedAt: O };
}[F];

export const SchoolsOrderingMap = <O extends Order>(order: O) =>
  ({
    city: { city: order } as const,
    createdAt: { createdAt: order } as const,
    name: { name: order } as const,
    shortName: { shortName: order } as const,
    state: { state: order } as const,
    updatedAt: { updatedAt: order } as const,
  }) satisfies { [key in SchoolOrderableField]: SchoolsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? Record<F, O>
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getSchoolsOrdering = <F extends SchoolOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | OrderingToPrisma<typeof SchoolsDefaultOrdering>
  | PrismaOrdering<'createdAt', 'desc'>
  | PrismaOrdering<'id', 'desc'>
  | SchoolsMappedPrismaOrdering<F, O>
)[] => {
  if (ordering) {
    const map = SchoolsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | PrismaOrdering<'createdAt', 'desc'>
      | PrismaOrdering<'id', 'desc'>
      | SchoolsMappedPrismaOrdering<F, O>
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
        | SchoolsMappedPrismaOrdering<F, O> => v !== undefined,
    );
  }
  return [
    { [SchoolsDefaultOrdering.orderBy]: SchoolsDefaultOrdering.order },
    { createdAt: 'desc' },
    { id: 'desc' },
  ] as const;
};

export const SchoolsFiltersObj = new Filters({
  educations: Filters.multiString({ typeguard: isUuid }),
  search: Filters.search(),
});

export type SchoolsFilters = FiltersValues<typeof SchoolsFiltersObj>;

export type SchoolsControls<I extends SchoolIncludes = SchoolIncludes> = Controls<
  I,
  SchoolsFilters,
  SchoolOrderableField
>;

export type FlattenedSchoolsControls<I extends SchoolIncludes = SchoolIncludes> = FlattenedControls<
  I,
  SchoolsFilters,
  SchoolOrderableField
>;

export type SchoolControls<I extends SchoolIncludes = SchoolIncludes> = Pick<
  SchoolsControls<I>,
  'includes' | 'visibility'
>;

// Used for API Routes
export const SchoolIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === 'string') {
    return SchoolIncludesFields.contains(value) ? [value] : [];
  }
  return value.reduce(
    (prev, curr) => (SchoolIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as SchoolIncludesField[],
  );
});
