import { z } from 'zod';

import {
  Degrees,
  type EducationIncludes,
  type EducationIncludesField,
  EducationIncludesFields,
} from '~/database/model';
import { Filters, type FiltersValues } from '~/lib/filters';
import { type Order, type Ordering } from '~/lib/ordering';
import { isUuid } from '~/lib/typeguards';

import { type Controls, type FlattenedControls } from './controls';

export const EducationOrderableFields = [
  'major',
  'shortMajor',
  'createdAt',
  'updatedAt',
  'startDate',
  'endDate',
  'school',
] as const;

export type EducationOrderableField = (typeof EducationOrderableFields)[number];

export const EducationsDefaultOrdering: Ordering<'startDate', 'desc'> = {
  order: 'desc',
  orderBy: 'startDate',
} satisfies Ordering<EducationOrderableField>;

type EducationsMappedPrismaOrdering<
  F extends EducationOrderableField = EducationOrderableField,
  O extends Order = Order,
> = {
  readonly createdAt: { createdAt: O };
  readonly endDate: { endDate: O };
  readonly major: { major: O };
  readonly school: { school: { name: O } };
  readonly shortMajor: { shortMajor: O };
  readonly startDate: { startDate: O };
  readonly updatedAt: { updatedAt: O };
}[F];

export const EducationsOrderingMap = <O extends Order>(order: O) =>
  ({
    createdAt: { createdAt: order } as const,
    endDate: { endDate: order } as const,
    major: { major: order } as const,
    school: { school: { name: order } } as const,
    shortMajor: { shortMajor: order } as const,
    startDate: { startDate: order } as const,
    updatedAt: { updatedAt: order } as const,
  }) satisfies { [key in EducationOrderableField]: EducationsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? Record<F, O>
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getEducationsOrdering = <F extends EducationOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | EducationsMappedPrismaOrdering<F, O>
  | OrderingToPrisma<typeof EducationsDefaultOrdering>
  | PrismaOrdering<'createdAt', 'desc'>
  | PrismaOrdering<'id', 'desc'>
)[] => {
  if (ordering) {
    const map = EducationsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | EducationsMappedPrismaOrdering<F, O>
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
        | EducationsMappedPrismaOrdering<F, O>
        | PrismaOrdering<'createdAt', 'desc'>
        | PrismaOrdering<'id', 'desc'> => v !== undefined,
    );
  }
  return [
    { [EducationsDefaultOrdering.orderBy]: EducationsDefaultOrdering.order },
    { createdAt: 'desc' },
    { id: 'desc' },
  ] as const;
};

export const EducationsFiltersObj = new Filters({
  courses: Filters.multiString({ typeguard: isUuid }),
  degrees: Filters.multiEnum(Degrees.contains.bind(Degrees)),
  highlighted: Filters.flag(),
  postPoned: Filters.flag(),
  schools: Filters.multiString({ typeguard: isUuid }),
  search: Filters.search(),
  skills: Filters.multiString({ typeguard: isUuid }),
  visible: Filters.flag(),
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
  'includes' | 'visibility'
>;

// Used for API Routes
export const EducationIncludesSchema = z
  .union([z.string(), z.array(z.string())])
  .transform(value => {
    if (typeof value === 'string') {
      return EducationIncludesFields.contains(value) ? [value] : [];
    }
    return value.reduce(
      (prev, curr) => (EducationIncludesFields.contains(curr) ? [...prev, curr] : prev),
      [] as EducationIncludesField[],
    );
  });
