import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { type BrandCourse, type BrandEducation } from './brand';
import { type ConditionallyInclude } from './inclusion';
import { type ApiSkill } from './skills';

export const CourseIncludesFields = enumeratedLiterals(['skills', 'education'] as const, {});
export type CourseIncludesField = EnumeratedLiteralsMember<typeof CourseIncludesFields>;

export type CourseIncludes = CourseIncludesField[];

export type ApiCourse<I extends CourseIncludes = []> = ConditionallyInclude<
  {
    readonly education: BrandEducation;
    readonly skills: ApiSkill[];
  } & BrandCourse,
  ['skills', 'education'],
  I
>;
