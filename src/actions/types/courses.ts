import { z } from 'zod';

import {
  type CourseIncludes,
  type CourseIncludesField,
  CourseIncludesFields,
} from '~/database/model';
import { Filters, type FiltersValues } from '~/lib/filters';
import { type Order, type Ordering } from '~/lib/ordering';
import { isUuid } from '~/lib/typeguards';

import { type Controls, type FlattenedControls } from './controls';

export const CourseOrderableFields = [
  'name',
  'shortName',
  'slug',
  'createdAt',
  'updatedAt',
  'education',
] as const;

export type CourseOrderableField = (typeof CourseOrderableFields)[number];

export const CoursesDefaultOrdering: Ordering<'name', 'desc'> = {
  order: 'desc',
  orderBy: 'name',
} satisfies Ordering<CourseOrderableField>;

type CoursesMappedPrismaOrdering<
  F extends CourseOrderableField = CourseOrderableField,
  O extends Order = Order,
> = {
  readonly createdAt: { createdAt: O };
  readonly education: { education: { major: O } };
  readonly name: { name: O };
  readonly shortName: { shortName: O };
  readonly slug: { slug: O };
  readonly updatedAt: { updatedAt: O };
}[F];

export const CoursesOrderingMap = <O extends Order>(order: O) =>
  ({
    createdAt: { createdAt: order } as const,
    education: { education: { major: order } } as const,
    name: { name: order } as const,
    shortName: { shortName: order } as const,
    slug: { slug: order } as const,
    updatedAt: { updatedAt: order } as const,
  }) satisfies { [key in CourseOrderableField]: CoursesMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? Record<F, O>
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getCoursesOrdering = <F extends CourseOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | CoursesMappedPrismaOrdering<F, O>
  | OrderingToPrisma<typeof CoursesDefaultOrdering>
  | PrismaOrdering<'createdAt', 'desc'>
  | PrismaOrdering<'id', 'desc'>
)[] => {
  if (ordering) {
    const map = CoursesOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | CoursesMappedPrismaOrdering<F, O>
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
        | CoursesMappedPrismaOrdering<F, O>
        | PrismaOrdering<'createdAt', 'desc'>
        | PrismaOrdering<'id', 'desc'> => v !== undefined,
    );
  }
  return [
    { [CoursesDefaultOrdering.orderBy]: CoursesDefaultOrdering.order },
    { createdAt: 'desc' },
    { id: 'desc' },
  ] as const;
};

export const CoursesFiltersObj = new Filters({
  educations: Filters.multiString({ typeguard: isUuid }),
  search: Filters.search(),
  skills: Filters.multiString({ typeguard: isUuid }),
  visible: Filters.flag(),
});

export type CoursesFilters = FiltersValues<typeof CoursesFiltersObj>;

export type CoursesControls<I extends CourseIncludes = CourseIncludes> = Controls<
  I,
  CoursesFilters,
  CourseOrderableField
>;

export type FlattenedCoursesControls<I extends CourseIncludes = CourseIncludes> = FlattenedControls<
  I,
  CoursesFilters,
  CourseOrderableField
>;

export type CourseControls<I extends CourseIncludes = CourseIncludes> = Pick<
  CoursesControls<I>,
  'includes' | 'visibility'
>;

// Used for API Routes
export const CourseIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === 'string') {
    return CourseIncludesFields.contains(value) ? [value] : [];
  }
  return value.reduce(
    (prev, curr) => (CourseIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as CourseIncludesField[],
  );
});
