import { type Experience, type Company } from "./core";
import { type ApiDetail } from "./details";
import { type ConditionallyIncluded } from "./inclusion";
import { type ApiSkill } from "./skills";

export type ExpIncludes = Partial<{
  readonly skills: boolean;
  readonly details: boolean;
}>;

type _BaseApiExperience = Experience & { readonly company: Company };

export type ApiExperience<I extends ExpIncludes = { skills: false; details: false }> =
  ConditionallyIncluded<
    _BaseApiExperience,
    {
      readonly details: ApiDetail<{ skills: true; nestedDetails: true }>[];
      readonly skills: Omit<ApiSkill, "autoExperience">[];
    },
    I
  >;
