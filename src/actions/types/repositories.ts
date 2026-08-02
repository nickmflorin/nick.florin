import { z } from 'zod';

import {
  type RepositoryIncludes,
  type RepositoryIncludesField,
  RepositoryIncludesFields,
} from '~/database/model';
import { Filters, type FiltersValues } from '~/lib/filters';
import { type Order, type Ordering } from '~/lib/ordering';
import { isUuid } from '~/lib/typeguards';

import { type Controls, type FlattenedControls } from './controls';

export const RepositoryOrderableFields = [
  'slug',
  'description',
  'startDate',
  'npmPackageName',
  'createdAt',
  'updatedAt',
] as const;

export type RepositoryOrderableField = (typeof RepositoryOrderableFields)[number];

export const RepositoriesDefaultOrdering: Ordering<'startDate', 'desc'> = {
  order: 'desc',
  orderBy: 'startDate',
} satisfies Ordering<RepositoryOrderableField>;

type RepositoriesMappedPrismaOrdering<
  F extends RepositoryOrderableField = RepositoryOrderableField,
  O extends Order = Order,
> = {
  readonly createdAt: { createdAt: O };
  readonly description: { description: O };
  readonly npmPackageName: { npmPackageName: O };
  readonly slug: { slug: O };
  readonly startDate: { startDate: O };
  readonly updatedAt: { updatedAt: O };
}[F];

export const RepositoriesOrderingMap = <O extends Order>(order: O) =>
  ({
    createdAt: { createdAt: order } as const,
    description: { description: order } as const,
    npmPackageName: { npmPackageName: order } as const,
    slug: { slug: order } as const,
    startDate: { startDate: order } as const,
    updatedAt: { updatedAt: order } as const,
  }) satisfies { [key in RepositoryOrderableField]: RepositoriesMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? Record<F, O>
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getRepositoriesOrdering = <F extends RepositoryOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | OrderingToPrisma<typeof RepositoriesDefaultOrdering>
  | PrismaOrdering<'createdAt', 'desc'>
  | PrismaOrdering<'id', 'desc'>
  | RepositoriesMappedPrismaOrdering<F, O>
)[] => {
  if (ordering) {
    const map = RepositoriesOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | PrismaOrdering<'createdAt', 'desc'>
      | PrismaOrdering<'id', 'desc'>
      | RepositoriesMappedPrismaOrdering<F, O>
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
        | RepositoriesMappedPrismaOrdering<F, O> => v !== undefined,
    );
  }
  return [
    { [RepositoriesDefaultOrdering.orderBy]: RepositoriesDefaultOrdering.order },
    { createdAt: 'desc' },
    { id: 'desc' },
  ] as const;
};

export const RepositoriesFiltersObj = new Filters({
  highlighted: Filters.flag(),
  projects: Filters.multiString({ typeguard: isUuid }),
  search: Filters.search(),
  skills: Filters.multiString({ typeguard: isUuid }),
  visible: Filters.flag(),
});

export type RepositoriesFilters = FiltersValues<typeof RepositoriesFiltersObj>;

export type RepositoriesControls<I extends RepositoryIncludes = RepositoryIncludes> = Controls<
  I,
  RepositoriesFilters,
  RepositoryOrderableField
>;

export type FlattenedRepositoriesControls<I extends RepositoryIncludes = RepositoryIncludes> =
  FlattenedControls<I, RepositoriesFilters, RepositoryOrderableField>;

export type RepositoryControls<I extends RepositoryIncludes = RepositoryIncludes> = Pick<
  RepositoriesControls<I>,
  'includes' | 'visibility'
>;

// Used for API Routes
export const RepositoryIncludesSchema = z
  .union([z.string(), z.array(z.string())])
  .transform(value => {
    if (typeof value === 'string') {
      return RepositoryIncludesFields.contains(value) ? [value] : [];
    }
    return value.reduce(
      (prev, curr) => (RepositoryIncludesFields.contains(curr) ? [...prev, curr] : prev),
      [] as RepositoryIncludesField[],
    );
  });
