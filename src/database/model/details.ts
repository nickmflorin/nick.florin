import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import {
  type BrandDetail,
  type BrandEducation,
  type BrandExperience,
  type BrandNestedDetail,
} from './brand';
import { type ConditionallyInclude } from './inclusion';
import { DetailEntityType } from './prisma-client';
import { type ApiProject } from './project';
import { type ApiSkill } from './skills';

export const DetailEntityTypes = enumeratedLiterals(
  [
    { label: 'Education', value: DetailEntityType.EDUCATION },
    { label: 'Experience', value: DetailEntityType.EXPERIENCE },
  ] as const satisfies {
    label: string;
    value: DetailEntityType;
  }[],
  {},
);

export type DetailEntity<T extends DetailEntityType> = {
  readonly [DetailEntityType.EDUCATION]: BrandEducation;
  readonly [DetailEntityType.EXPERIENCE]: BrandExperience;
}[T];

export const NestedDetailIncludesFields = enumeratedLiterals(['skills'] as const, {});
export type NestedDetailIncludesField = EnumeratedLiteralsMember<typeof NestedDetailIncludesFields>;

export type NestedDetailIncludes = NestedDetailIncludesField[];

export type ApiNestedDetail<I extends NestedDetailIncludes = []> = ConditionallyInclude<
  {
    readonly project: ApiProject<I> | null;
    readonly skills: ApiSkill[];
  } & BrandNestedDetail,
  ['skills'],
  I
>;

export const DetailIncludesFields = enumeratedLiterals(['skills', 'nestedDetails'] as const, {});
export type DetailIncludesField = EnumeratedLiteralsMember<typeof DetailIncludesFields>;

export type DetailIncludes = DetailIncludesField[];

export type ToSkillIncludes<I extends DetailIncludes> = 'skills' extends I[number]
  ? ['skills']
  : [];

export type ApiDetail<I extends DetailIncludes = []> = ConditionallyInclude<
  {
    readonly nestedDetails: ApiNestedDetail<ToSkillIncludes<I>>[];
    readonly project: ApiProject<ToSkillIncludes<I>> | null;
    readonly skills: ApiSkill[];
  } & BrandDetail,
  ['skills', 'nestedDetails'],
  I
>;

/**
 * Returns whether or not the provided detail is an {@link ApiNestedDetail}, as opposed to a
 * top-level {@link ApiDetail}.
 *
 * Both the parameter and the type predicate are expressed in terms of details that include no
 * relations, because those forms are the ones that every other set of includes is assignable to.
 * Referencing the includes with type parameters instead would leave them impossible to infer,
 * because they do not appear anywhere in the argument that TypeScript can infer them from.
 */
export const isNestedDetail = (
  detail: ApiDetail<[]> | ApiNestedDetail<[]>,
): detail is ApiNestedDetail<[]> => 'detailId' in detail;
