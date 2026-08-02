import { enumeratedLiterals, type EnumeratedLiteralsMember } from 'enumerated-literals';

import { type BrandCompany, type BrandExperience } from './brand';
import { type ConditionallyInclude } from './inclusion';

export const CompanyIncludesFields = enumeratedLiterals(['experiences'] as const, {});
export type CompanyIncludesField = EnumeratedLiteralsMember<typeof CompanyIncludesFields>;

export type CompanyIncludes = CompanyIncludesField[];

export type ApiCompany<I extends CompanyIncludes> = ConditionallyInclude<
  { readonly experiences: BrandExperience[] } & BrandCompany,
  ['experiences'],
  I
>;
