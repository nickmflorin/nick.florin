import { type Project } from "./core";
import { type ConditionallyInclude } from "./inclusion";
import { type ApiSkill } from "./skills";

export type ProjectIncludes = ["skills"] | [];

export type ApiProject<I extends ProjectIncludes = []> = ConditionallyInclude<
  Project & {
    readonly skills: Omit<ApiSkill, "autoExperience">[];
  },
  ["skills"],
  I
>;
