import { z } from 'zod';

import {
  DetailEntityTypes,
  type DetailIncludes,
  type DetailIncludesField,
  DetailIncludesFields,
} from '~/database/model';
import { Filters, type FiltersValues } from '~/lib/filters';
import { type Order, type Ordering } from '~/lib/ordering';
import { isUuid } from '~/lib/typeguards';

import { type Controls, type FlattenedControls } from './controls';

/* Note: Currently, the ordering and filtering aspects of data manipulation for Details are not used
   by the client (even though the fetch actions support them). However, these are left here so we
   can eventually incorporate a details table similarly to the other tables in the admin. */
export const DetailOrderableFields = ['label', 'createdAt', 'updatedAt', 'project'] as const;

export type DetailOrderableField = (typeof DetailOrderableFields)[number];

export const DetailsDefaultOrdering: Ordering<'createdAt', 'desc'> = {
  order: 'desc',
  orderBy: 'createdAt',
} satisfies Ordering<DetailOrderableField>;

type DetailsMappedPrismaOrdering<
  F extends DetailOrderableField = DetailOrderableField,
  O extends Order = Order,
> = {
  readonly createdAt: { createdAt: O };
  readonly label: { label: O };
  readonly project: { project: { name: O } };
  readonly updatedAt: { updatedAt: O };
}[F];

export const DetailsOrderingMap = <O extends Order>(order: O) =>
  ({
    createdAt: { createdAt: order } as const,
    label: { label: order } as const,
    project: { project: { name: order } } as const,
    updatedAt: { updatedAt: order } as const,
  }) satisfies { [key in DetailOrderableField]: DetailsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? Record<F, O>
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getDetailsOrdering = <F extends DetailOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | DetailsMappedPrismaOrdering<F, O>
  | OrderingToPrisma<typeof DetailsDefaultOrdering>
  | PrismaOrdering<'id', 'desc'>
)[] => {
  if (ordering) {
    const map = DetailsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | DetailsMappedPrismaOrdering<F, O>
      | PrismaOrdering<'createdAt', 'desc'>
      | PrismaOrdering<'id', 'desc'>
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
        | DetailsMappedPrismaOrdering<F, O>
        | PrismaOrdering<'createdAt', 'desc'>
        | PrismaOrdering<'id', 'desc'> => v !== undefined,
    );
  }
  return [
    { [DetailsDefaultOrdering.orderBy]: DetailsDefaultOrdering.order },
    { createdAt: 'desc' },
    { id: 'desc' },
  ] as const;
};

export const DetailsFiltersObj = new Filters({
  entityIds: Filters.multiString({ typeguard: isUuid }),
  entityTypes: Filters.multiEnum(DetailEntityTypes.contains.bind(DetailEntityTypes)),
  search: Filters.search(),
  skills: Filters.multiString({ typeguard: isUuid }),
  visible: Filters.flag(),
});

export type DetailsFilters = FiltersValues<typeof DetailsFiltersObj>;

export type DetailsControls<
  I extends DetailIncludes = DetailIncludes,
  F extends Record<string, unknown> = DetailsFilters,
> = Controls<I, F, DetailOrderableField>;

export type FlattenedDetailsControls<I extends DetailIncludes = DetailIncludes> = FlattenedControls<
  I,
  DetailsFilters,
  DetailOrderableField
>;

export type DetailControls<I extends DetailIncludes = DetailIncludes> = Pick<
  DetailsControls<I>,
  'includes' | 'visibility'
>;

// Used for API Routes
export const DetailIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === 'string') {
    return DetailIncludesFields.contains(value) ? [value] : [];
  }
  return value.reduce(
    (prev, curr) => (DetailIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as DetailIncludesField[],
  );
});
