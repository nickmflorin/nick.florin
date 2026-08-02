import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { type BrandModel } from './brand';
import { type ApiDetail } from './details';
import { type ConditionallyInclude } from './inclusion';
import { type ApiSkill } from './skills';

export const ExperienceIncludesFields = enumeratedLiterals(['skills', 'details'] as const, {});
export type ExperienceIncludesField = EnumeratedLiteralsMember<typeof ExperienceIncludesFields>;

export type ExperienceIncludes = ExperienceIncludesField[];

export type ExperienceToDetailIncludes<I extends ExperienceIncludes> = 'skills' extends I[number]
  ? ['nestedDetails', 'skills']
  : ['nestedDetails'];

export type ApiExperience<I extends ExperienceIncludes = []> = ConditionallyInclude<
  {
    readonly details: ApiDetail<ExperienceToDetailIncludes<I>>[];
    readonly skills: ApiSkill[];
  } & BrandModel<'experience'>,
  ['skills', 'details'],
  I
>;
