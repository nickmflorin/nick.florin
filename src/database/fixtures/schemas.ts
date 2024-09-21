import { z } from "zod";

import type * as types from "./types";

import { Degree, SkillCategory, ProgrammingLanguage, ProgrammingDomain } from "~/database/model";
import { NullableStringField, NonNullableStringField } from "~/lib/schemas";

const SkillReferenceJsonSchema = z.string();

const MetaSchema = z.object({
  updatedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
});

export const SkillJsonSchema = MetaSchema.extend({
  label: NonNullableStringField({}),
  slug: NullableStringField({}).optional(),
  description: NullableStringField({}),
  visible: z.boolean().optional(),
  experience: z.number().int().nonnegative().nullable().optional(),
  categories: z.array(z.nativeEnum(SkillCategory)).optional(),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)).optional(),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)).optional(),
  includeInTopSkills: z.boolean().optional(),
});

export type JsonSkill = z.infer<typeof SkillJsonSchema>;

export const CourseJsonSchema = MetaSchema.extend({
  name: NonNullableStringField({}),
  shortName: NullableStringField({}).optional(),
  slug: NullableStringField({}).optional(),
  description: NullableStringField({}).optional(),
  visible: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
});

export const RepositoryJsonSchema = MetaSchema.extend({
  slug: z.string(),
  visible: z.boolean().optional(),
  /* This field is optional because it will be supplied via GitHub's API in the case that it is
     not defined in the fixture. */
  description: z.string().nullable().optional(),
  skills: z.array(z.string()),
  /* This field is optional because it will be supplied via GitHub's API in the case that it is
     not defined in the fixture. */
  startDate: z.coerce.date().optional(),
  npmPackageName: z.string().nullable().optional(),
  highlighted: z.boolean().optional(),
});

export const ProjectJsonSchema = MetaSchema.extend({
  name: NonNullableStringField({}),
  shortName: NullableStringField({}).optional(),
  slug: NullableStringField({}).optional(),
  description: NonNullableStringField({}),
  startDate: z.coerce.date(),
  visible: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  repositories: z.array(z.string()).optional(),
  highlighted: z.boolean().optional(),
});

export const NestedDetailJsonSchema = MetaSchema.extend({
  label: NonNullableStringField({}),
  description: NullableStringField({}).optional(),
  skills: z.array(z.string()).optional(),
  project: z.string().nullable().optional(),
});

export type JsonNestedDetail = z.infer<typeof NestedDetailJsonSchema>;

export const DetailJsonSchema = MetaSchema.extend({
  label: NonNullableStringField({}),
  description: NullableStringField({}).optional(),
  nestedDetails: z.array(NestedDetailJsonSchema).optional(),
  skills: z.array(z.string()).optional(),
  project: NullableStringField({}).optional(),
});

export type JsonDetail = z.infer<typeof DetailJsonSchema>;

export const ExperienceJsonSchema = MetaSchema.extend({
  title: NonNullableStringField({}),
  shortTitle: NullableStringField({}).optional(),
  description: NullableStringField({}).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  isRemote: z.boolean().optional(),
  skills: z.array(SkillReferenceJsonSchema).optional(),
  details: z.array(DetailJsonSchema).optional(),
  highlighted: z.boolean().optional(),
});

export const EducationJsonSchema = MetaSchema.extend({
  major: NonNullableStringField({}),
  shortMajor: NullableStringField({}).optional(),
  minor: NullableStringField({}).optional(),
  concentration: NullableStringField({}).optional(),
  websiteUrl: NullableStringField({}).optional(),
  description: NullableStringField({}).optional(),
  note: NullableStringField({}).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  postponed: z.boolean().optional(),
  degree: z.nativeEnum(Degree),
  skills: z.array(SkillReferenceJsonSchema).optional(),
  details: z.array(DetailJsonSchema).optional(),
  courses: z.array(CourseJsonSchema).optional(),
  highlighted: z.boolean().optional(),
});

export const CompanyJsonSchema = MetaSchema.extend({
  city: NonNullableStringField({}),
  state: NonNullableStringField({}),
  logoImageUrl: NullableStringField({}).optional(),
  name: NonNullableStringField({}),
  shortName: NullableStringField({}).optional(),
  description: NullableStringField({}).optional(),
  websiteUrl: NullableStringField({}).optional(),
  experiences: z.array(ExperienceJsonSchema).optional(),
});

export const SchoolJsonSchema = MetaSchema.extend({
  city: NonNullableStringField({}),
  state: NonNullableStringField({}),
  logoImageUrl: NullableStringField({}).optional(),
  name: NonNullableStringField({}),
  shortName: NullableStringField({}).optional(),
  description: NullableStringField({}).optional(),
  websiteUrl: NullableStringField({}).optional(),
  educations: z.array(EducationJsonSchema).optional(),
});

export const ProfileJsonSchema = MetaSchema.extend({
  firstName: NonNullableStringField({}),
  lastName: NonNullableStringField({}),
  middleName: NullableStringField({}),
  profileImageUrl: NullableStringField({}),
  intro: NonNullableStringField({}),
  githubUrl: NullableStringField({}),
  linkedinUrl: NullableStringField({}),
  emailAddress: NonNullableStringField({}),
  displayName: NonNullableStringField({}),
  tagline: NullableStringField({}),
  phoneNumber: NullableStringField({}),
});

export const JsonSchemas = {
  school: SchoolJsonSchema,
  company: CompanyJsonSchema,
  skill: SkillJsonSchema,
  repository: RepositoryJsonSchema,
  project: ProjectJsonSchema,
  profile: ProfileJsonSchema,
} as const satisfies {
  [key in types.JsonifiableModel]: z.ZodObject<z.ZodRawShape>;
};
