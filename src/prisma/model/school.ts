import { type School, type Education } from "./core";
import { type ConditionallyInclude } from "./inclusion";

export type SchoolIncludes = ["educations"] | [];

export type ApiSchool<I extends SchoolIncludes> = ConditionallyInclude<
  School & { readonly educations: Education[] },
  ["educations"],
  I
>;
