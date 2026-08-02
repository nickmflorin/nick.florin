import { z } from 'zod';

import {
  ProgrammingDomains,
  ProgrammingLanguages,
  SkillCategories,
  type SkillIncludes,
  type SkillIncludesField,
  SkillIncludesFields,
} from '~/database/model';
import { Filters, type FiltersValues } from '~/lib/filters';
import { type Order, type Ordering } from '~/lib/ordering';
import { isUuid } from '~/lib/typeguards';

import { type Controls, type FlattenedControls } from './controls';

export const SkillOrderableFields = [
  'label',
  'slug',
  'createdAt',
  'updatedAt',
  'calculatedExperience',
] as const;

export type SkillOrderableField = (typeof SkillOrderableFields)[number];

export const SkillsDefaultOrdering: Ordering<'label', 'asc'> = {
  order: 'asc',
  orderBy: 'label',
} satisfies Ordering<SkillOrderableField>;

type SkillsMappedPrismaOrdering<
  F extends SkillOrderableField = SkillOrderableField,
  O extends Order = Order,
> = {
  readonly calculatedExperience: { calculatedExperience: O };
  readonly createdAt: { createdAt: O };
  readonly label: { label: O };
  readonly slug: { slug: O };
  readonly updatedAt: { updatedAt: O };
}[F];

export const SkillsOrderingMap = <O extends Order>(order: O) =>
  ({
    calculatedExperience: { calculatedExperience: order } as const,
    createdAt: { createdAt: order } as const,
    label: { label: order } as const,
    slug: { slug: order } as const,
    updatedAt: { updatedAt: order } as const,
  }) satisfies { [key in SkillOrderableField]: SkillsMappedPrismaOrdering<key, O> };

type PrismaOrdering<F extends string, O extends Order = Order> = F extends string
  ? Record<F, O>
  : never;

type OrderingToPrisma<O extends Ordering> =
  O extends Ordering<infer F, infer Or> ? PrismaOrdering<F, Or> : never;

export const getSkillsOrdering = <F extends SkillOrderableField, O extends Order>(
  ordering?: Ordering<F, O>,
): (
  | OrderingToPrisma<typeof SkillsDefaultOrdering>
  | PrismaOrdering<'createdAt', 'desc'>
  | PrismaOrdering<'id', 'desc'>
  | SkillsMappedPrismaOrdering<F, O>
)[] => {
  if (ordering) {
    const map = SkillsOrderingMap(ordering.order)[ordering.orderBy];
    const arr: (
      | PrismaOrdering<'createdAt', 'desc'>
      | PrismaOrdering<'id', 'desc'>
      | SkillsMappedPrismaOrdering<F, O>
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
        | SkillsMappedPrismaOrdering<F, O> => v !== undefined,
    );
  }
  return [
    { [SkillsDefaultOrdering.orderBy]: SkillsDefaultOrdering.order },
    { createdAt: 'desc' },
    { id: 'desc' },
  ] as const;
};

export const SkillsFiltersObj = new Filters({
  categories: Filters.multiEnum(SkillCategories.contains.bind(SkillCategories)),
  educations: Filters.multiString({ typeguard: isUuid }),
  experiences: Filters.multiString({ typeguard: isUuid }),
  highlighted: Filters.flag(),
  prioritized: Filters.flag(),
  programmingDomains: Filters.multiEnum(ProgrammingDomains.contains.bind(ProgrammingDomains)),
  programmingLanguages: Filters.multiEnum(ProgrammingLanguages.contains.bind(ProgrammingLanguages)),
  projects: Filters.multiString({ typeguard: isUuid }),
  repositories: Filters.multiString({ typeguard: isUuid }),
  search: Filters.search(),
  visible: Filters.flag(),
});

export type SkillsFilters = FiltersValues<typeof SkillsFiltersObj>;

export type SkillsControls<I extends SkillIncludes = SkillIncludes> = Controls<
  I,
  SkillsFilters,
  SkillOrderableField
>;

export type FlattenedSkillsControls<I extends SkillIncludes = SkillIncludes> = FlattenedControls<
  I,
  SkillsFilters,
  SkillOrderableField
>;

export type SkillControls<I extends SkillIncludes = SkillIncludes> = Pick<
  SkillsControls<I>,
  'includes' | 'visibility'
>;

// Used for API Routes
export const SkillIncludesSchema = z.union([z.string(), z.array(z.string())]).transform(value => {
  if (typeof value === 'string') {
    return SkillIncludesFields.contains(value) ? [value] : [];
  }
  return value.reduce(
    (prev, curr) => (SkillIncludesFields.contains(curr) ? [...prev, curr] : prev),
    [] as SkillIncludesField[],
  );
});
