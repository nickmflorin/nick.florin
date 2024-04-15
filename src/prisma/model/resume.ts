import { type BrandResume } from "./brand";
import { type ConditionallyInclude } from "./inclusion";

export type ResumeIncludes = [] | ["primary"];

export type ApiResume<I extends ResumeIncludes> = ConditionallyInclude<
  BrandResume & { readonly primary: boolean },
  ["primary"],
  I
>;
