import { z } from "zod";

import { Degree, SkillCategory, ProgrammingLanguage, ProgrammingDomain } from "../model";

import companies from "./companies.json";
import profile from "./profile.json";
import schools from "./schools.json";
import skills from "./skills.json";

const SkillReferenceJsonSchema = z.string();

const SkillJsonSchema = z.object({
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

const NestedDetailJsonSchema = z.object({
  label: z.string(),
  description: z.string(),
});

const DetailJsonSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  nestedDetails: z.array(NestedDetailJsonSchema).optional(),
});

const ExperienceJsonSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  isRemote: z.boolean().optional(),
  skills: z.array(SkillReferenceJsonSchema).optional(),
  details: z.array(DetailJsonSchema).optional(),
});

const EducationJsonSchema = z.object({
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
});

const CompanyJsonSchema = z.object({
  city: z.string(),
  state: z.string(),
  logoImageUrl: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  websiteUrl: z.string().optional(),
  experiences: z.array(ExperienceJsonSchema).nonempty(),
});

const SchoolJsonSchema = z.object({
  city: z.string(),
  state: z.string(),
  logoImageUrl: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  websiteUrl: z.string().optional(),
  educations: z.array(EducationJsonSchema).nonempty(),
});

export const json = {
  schools: schools.schools.map((c): z.infer<typeof SchoolJsonSchema> => SchoolJsonSchema.parse(c)),
  skills: skills.skills.map((sk): z.infer<typeof SkillJsonSchema> => SkillJsonSchema.parse(sk)),
  companies: companies.companies.map(
    (c): z.infer<typeof CompanyJsonSchema> => CompanyJsonSchema.parse(c),
  ),
  profile,
};
