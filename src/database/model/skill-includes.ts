import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { type ApiEducation, type ApiExperience } from '~/database/model';

import { type BrandProject, type BrandRepository, type BrandSkill } from './brand';
import { type ApiCourse } from './course';
import { type ConditionallyInclude } from './inclusion';

export const SkillIncludesFields = enumeratedLiterals(
  ['educations', 'experiences', 'projects', 'repositories', 'courses'] as const,
  {},
);
export type SkillIncludesField = EnumeratedLiteralsMember<typeof SkillIncludesFields>;

/**
 * Use a GitHub gist to generate.
 */
export type SkillIncludes = SkillIncludesField[];

export type ApiSkill<I extends SkillIncludes = []> = ConditionallyInclude<
  {
    readonly courses: ApiCourse[];
    readonly educations: ApiEducation[];
    readonly experiences: ApiExperience[];
    readonly projects: BrandProject[];
    readonly repositories: BrandRepository[];
  } & BrandSkill,
  ['educations', 'experiences', 'projects', 'repositories', 'courses'],
  I
>;
