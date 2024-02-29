import { z } from "zod";

import { NullableMinLengthStringField } from "~/lib/schemas";
import { ProgrammingDomain, ProgrammingLanguage, SkillCategory } from "~/prisma/model";

export const SkillSchema = z.object({
  label: z.string().min(3, "The label must be at least 3 characters."),
  slug: NullableMinLengthStringField({
    minErrorMessage: "The slug must be at least 3 characters.",
  }).optional(),
  description: z.string().optional(),
  experiences: z.array(z.string().uuid()).optional(),
  educations: z.array(z.string().uuid()).optional(),
  includeInTopSkills: z.boolean().optional(),
  experience: z.number().nullable().optional(),
  visible: z.boolean().optional(),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)).optional(),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)).optional(),
  categories: z.array(z.nativeEnum(SkillCategory)).optional(),
});

export const ExperienceSchema = z.object({
  title: z.string().min(3, "The title must be at least 3 characters."),
  shortTitle: NullableMinLengthStringField({
    min: 3,
    minErrorMessage: "The short title should be at least 3 characters.",
  }).optional(),
  description: z.string().optional(),
  company: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  isRemote: z.boolean().optional(),
});
