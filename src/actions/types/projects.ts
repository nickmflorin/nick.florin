import { z } from 'zod';

import {
  type ProjectIncludes,
  type ProjectIncludesField,
  ProjectIncludesFields,
} from '~/database/model';
import { Filters, type FiltersValues } from '~/lib/filters';
import { type Order, type Ordering } from '~/lib/ordering';
import { isUuid } from '~/lib/typeguards';

import { type Controls, type FlattenedControls } from './controls';

export const ProjectOrderableFields = [
  'name',
  'shortName',
  'slug',
  'createdAt',
  'updatedAt',
  'startDate',
] as const;

export type ProjectOrderableField = (typeof ProjectOrderableFields)[number];

export const ProjectsDefaultOrdering: Ordering<'startDate', 'asc'> = {
  order: 'asc',
  orderBy: 'startDate',
} satisfies Ordering<ProjectOrderableField>;

type ProjectsMappedPrismaOrdering<
  F extends ProjectOrderableField = ProjectOrderableField,
  O extends Order = Order,
> = {
  readonly createdAt: { createdAt: O };
  readonly name: { name: O };
  readonly shortName: { shortName: O };
  readonly slug: { slug: O };
  readonly startDate: { startDate: O };
  readonly updatedAt: { updatedAt: O };
}[F];

export const ProjectsOrderingMap = <O extends Order>(order: O) =>
  ({
    createdAt: { createdAt: order } as const,
    name: { name: order } as const,
    shortName: { shortName: order } as const,
    slug: { slug: order } as const,
    startDate: { startDate: order } as const,
    updatedAt: { updatedAt: order } as const,
  }) satisfies { [key in ProjectOrderableField]: ProjectsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? Record<F, O>
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getProjectsOrdering = <F extends ProjectOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | OrderingToPrisma<typeof ProjectsDefaultOrdering>
  | PrismaOrdering<'createdAt', 'desc'>
  | PrismaOrdering<'id', 'desc'>
  | ProjectsMappedPrismaOrdering<F, O>
)[] => {
  if (ordering) {
    const map = ProjectsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | PrismaOrdering<'createdAt', 'desc'>
      | PrismaOrdering<'id', 'desc'>
      | ProjectsMappedPrismaOrdering<F, O>
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
        | ProjectsMappedPrismaOrdering<F, O> => v !== undefined,
    );
  }
  return [
    { [ProjectsDefaultOrdering.orderBy]: ProjectsDefaultOrdering.order },
    { createdAt: 'desc' },
    { id: 'desc' },
  ] as const;
};

export const ProjectsFiltersObj = new Filters({
  highlighted: Filters.flag(),
  repositories: Filters.multiString({ typeguard: isUuid }),
  search: Filters.search(),
  skills: Filters.multiString({ typeguard: isUuid }),
  visible: Filters.flag(),
});

export type ProjectsFilters = FiltersValues<typeof ProjectsFiltersObj>;

export type ProjectsControls<I extends ProjectIncludes = ProjectIncludes> = Controls<
  I,
  ProjectsFilters,
  ProjectOrderableField
>;

export type FlattenedProjectsControls<I extends ProjectIncludes = ProjectIncludes> =
  FlattenedControls<I, ProjectsFilters, ProjectOrderableField>;

export type ProjectControls<I extends ProjectIncludes = ProjectIncludes> = Pick<
  ProjectsControls<I>,
  'includes' | 'visibility'
>;

// Used for API Routes
export const ProjectIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === 'string') {
    return ProjectIncludesFields.contains(value) ? [value] : [];
  }
  return value.reduce(
    (prev, curr) => (ProjectIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as ProjectIncludesField[],
  );
});
