import { z } from "zod";

import { Degree, SkillCategory, ProgrammingLanguage, ProgrammingDomain } from "../../model";

const SkillReferenceJsonSchema = z.string();

export const SkillJsonSchema = z.object({
  label: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  visible: z.boolean().optional(),
  experience: z.number().int().positive().optional(),
  categories: z.array(z.nativeEnum(SkillCategory)).optional(),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)).optional(),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)).optional(),
  includeInTopSkills: z.boolean().optional(),
});

export const CourseJsonSchema = z.object({
  name: z.string(),
  shortName: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  visible: z.boolean().optional(),
});

export type JsonSkill = z.infer<typeof SkillJsonSchema>;

export const NestedDetailJsonSchema = z.object({
  label: z.string(),
  description: z.string(),
});

export const DetailJsonSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  nestedDetails: z.array(NestedDetailJsonSchema).optional(),
});

export const ExperienceJsonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  isRemote: z.boolean().optional(),
  skills: z.array(SkillReferenceJsonSchema).optional(),
  details: z.array(DetailJsonSchema).optional(),
});

export const EducationJsonSchema = z.object({
  major: z.string(),
  minor: z.string().optional(),
  concentration: z.string().optional(),
  websiteUrl: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  postponed: z.boolean().optional(),
  degree: z.nativeEnum(Degree),
  skills: z.array(SkillReferenceJsonSchema).optional(),
  details: z.array(DetailJsonSchema).optional(),
  courses: z.array(CourseJsonSchema).optional(),
});

export const CompanyJsonSchema = z.object({
  city: z.string(),
  state: z.string(),
  logoImageUrl: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  websiteUrl: z.string().optional(),
  experiences: z.array(ExperienceJsonSchema).nonempty(),
});

export const SchoolJsonSchema = z.object({
  city: z.string(),
  state: z.string(),
  logoImageUrl: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  websiteUrl: z.string().optional(),
  educations: z.array(EducationJsonSchema).nonempty(),
});
