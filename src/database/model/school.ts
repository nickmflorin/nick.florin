import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { type BrandEducation, type BrandSchool } from './brand';
import { type ConditionallyInclude } from './inclusion';

export const SchoolIncludesFields = enumeratedLiterals(['educations'] as const, {});
export type SchoolIncludesField = EnumeratedLiteralsMember<typeof SchoolIncludesFields>;

export type SchoolIncludes = SchoolIncludesField[];

export type ApiSchool<I extends SchoolIncludes> = ConditionallyInclude<
  { readonly educations: BrandEducation[] } & BrandSchool,
  ['educations'],
  I
>;
