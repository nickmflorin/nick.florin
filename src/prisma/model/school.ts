import { type BrandEducation, type BrandSchool } from "./brand";
import { type ConditionallyInclude } from "./inclusion";

export type SchoolIncludes = ["educations"] | [];

export type ApiSchool<I extends SchoolIncludes> = ConditionallyInclude<
  BrandSchool & { readonly educations: BrandEducation[] },
  ["educations"],
  I
>;
