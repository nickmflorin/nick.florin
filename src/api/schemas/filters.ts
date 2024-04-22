import { z } from "zod";

import { ProgrammingDomain, ProgrammingLanguage, SkillCategory } from "~/prisma/model/generated";

export const SkillsFiltersSchema = z.object({
  includeInTopSkills: z.boolean().optional(),
  experiences: z.array(z.string().uuid()).optional(),
  educations: z.array(z.string().uuid()).optional(),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)).optional(),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)).optional(),
  categories: z.array(z.nativeEnum(SkillCategory)).optional(),
  search: z.string().optional(),
});

export type SkillsFilters = z.infer<typeof SkillsFiltersSchema>;

export const ShowTopSkillsSchema = z.union([
  z.literal(5),
  z.literal(8),
  z.literal(12),
  z.literal("all"),
]);
export type ShowTopSkills = z.infer<typeof ShowTopSkillsSchema>;

export type ShowTopSkillsString = `${ShowTopSkills}`;
