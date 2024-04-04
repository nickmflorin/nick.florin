import { type Company, type Experience } from "./core";
import { type ConditionallyInclude } from "./inclusion";

export type CompanyIncludes = ["experiences"] | [];

export type ApiCompany<I extends CompanyIncludes> = ConditionallyInclude<
  Company & { readonly experiences: Experience[] },
  ["experiences"],
  I
>;
