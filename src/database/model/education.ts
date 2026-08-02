import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { type BrandModel } from './brand';
import { type ApiCourse } from './course';
import { type ApiDetail } from './details';
import { type ConditionallyInclude } from './inclusion';
import { Degree } from './prisma-client';
import { type ApiSkill } from './skills';

export const Degrees = enumeratedLiterals(
  [
    { label: 'Bachelors of Science', shortLabel: 'B.S.', value: Degree.BACHELORS_OF_SCIENCE },
    { label: 'Masters of Science', shortLabel: 'M.S.', value: Degree.MASTERS_OF_SCIENCE },
    {
      label: 'Masters of Science in Engineering',
      shortLabel: 'M.S.E.',
      value: Degree.MASTERS_OF_SCIENCE_IN_ENGINEERING,
    },
  ] as const satisfies { label: string; shortLabel: string; value: Degree }[],
  {},
);

export const EducationIncludesFields = enumeratedLiterals(
  ['skills', 'details', 'courses'] as const,
  {},
);
export type EducationIncludesField = EnumeratedLiteralsMember<typeof EducationIncludesFields>;

export type EducationIncludes = EducationIncludesField[];

export type EducationToCourseIncludes<I extends EducationIncludes> = 'skills' extends I[number]
  ? ['skills']
  : [];

export type EducationToDetailIncludes<I extends EducationIncludes> = 'skills' extends I[number]
  ? ['nestedDetails', 'skills']
  : ['nestedDetails'];

export type ApiEducation<I extends EducationIncludes = []> = ConditionallyInclude<
  {
    /**
     * We do not need to worry about skills that are nested under the courses because we never show
     * the skills associated with a course unless it is a detail view of the course.
     */
    readonly courses: ApiCourse<EducationToCourseIncludes<I>>[];
    readonly details: ApiDetail<EducationToDetailIncludes<I>>[];
    readonly skills: ApiSkill[];
  } & BrandModel<'education'>,
  ['skills', 'details', 'courses'],
  I
>;
