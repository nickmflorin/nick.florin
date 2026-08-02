import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { type IconName, type IconProp } from '~/components/icons';

import {
  type BrandDetail,
  type BrandNestedDetail,
  type BrandProject,
  type BrandRepository,
} from './brand';
import { type ConditionallyInclude } from './inclusion';
import { type ApiSkill } from './skills';

/**
 * Even though these are populated in the database, we need to have a non-dynamic (i.e. hard-coded)
 * list of project slugs to reference in UI logic.
 */
export const ProjectSlugs = enumeratedLiterals(
  [
    { icon: 'leaf', value: 'greenbudget' },
    { icon: 'chart-scatter-bubble', value: 'asset-visualizations' },
    { icon: 'passport', value: 'website' },
    { icon: 'screwdriver-wrench', value: 'tooltrack' },
  ] as const satisfies {
    readonly icon: IconName | IconProp;
    readonly value: string;
  }[],
  {},
);

export type ProjectSlug = EnumeratedLiteralsMember<typeof ProjectSlugs>;

export const ProjectIncludesFields = enumeratedLiterals(
  ['skills', 'repositories', 'nestedDetails', 'details'] as const,
  {},
);
export type ProjectIncludesField = EnumeratedLiteralsMember<typeof ProjectIncludesFields>;

export type ProjectIncludes = ProjectIncludesField[];

export type ApiProject<I extends ProjectIncludes = []> = ConditionallyInclude<
  {
    readonly details: BrandDetail[];
    readonly nestedDetails: BrandNestedDetail[];
    readonly repositories: BrandRepository[];
    readonly skills: ApiSkill[];
  } & BrandProject,
  ['skills', 'repositories', 'details', 'nestedDetails'],
  I
>;
