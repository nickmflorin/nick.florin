import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";

import { type BrandCompany, type BrandExperience } from "./brand";
import { type ConditionallyInclude } from "./inclusion";

export const CompanyIncludesFields = enumeratedLiterals(["experiences"] as const, {});
export type CompanyIncludesField = EnumeratedLiteralsMember<typeof CompanyIncludesFields>;

export type CompanyIncludes = ["experiences"] | [];

export type ApiCompany<I extends CompanyIncludes> = ConditionallyInclude<
  BrandCompany & { readonly experiences: BrandExperience[] },
  ["experiences"],
  I
>;
