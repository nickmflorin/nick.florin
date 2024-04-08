import { type BrandCompany, type BrandExperience } from "./brand";
import { type ConditionallyInclude } from "./inclusion";

export type CompanyIncludes = ["experiences"] | [];

export type ApiCompany<I extends CompanyIncludes> = ConditionallyInclude<
  BrandCompany & { readonly experiences: BrandExperience[] },
  ["experiences"],
  I
>;
