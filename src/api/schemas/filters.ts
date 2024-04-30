import { z } from "zod";

import { ProgrammingDomain, ProgrammingLanguage, SkillCategory } from "~/prisma/model/generated";

export const SkillsFiltersSchema = z.object({
  includeInTopSkills: z.boolean(),
  experiences: z.array(z.string().uuid()),
  educations: z.array(z.string().uuid()),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)),
  categories: z.array(z.nativeEnum(SkillCategory)),
  search: z.string(),
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
