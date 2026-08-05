import { z } from 'zod';

import type * as types from './types';

import {
  DegreeType,
  ProgrammingDomain,
  ProgrammingLanguage,
  SkillCategory,
} from '~/database/model';
import { NonNullableStringField, NullableStringField } from '~/lib/schemas';

const SkillReferenceJsonSchema = z.string();

const MetaSchema = z.object({
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const SkillJsonSchema = MetaSchema.extend({
  categories: z.array(z.nativeEnum(SkillCategory)).optional(),
  description: NullableStringField({}),
  experience: z.number().int().nonnegative().nullable().optional(),
  highlighted: z.boolean().optional(),
  label: NonNullableStringField({}),
  prioritized: z.boolean().optional(),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)).optional(),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)).optional(),
  slug: NullableStringField({}).optional(),
  visible: z.boolean().optional(),
});

export type JsonSkill = z.infer<typeof SkillJsonSchema>;

export const CourseJsonSchema = MetaSchema.extend({
  description: NullableStringField({}).optional(),
  name: NonNullableStringField({}),
  shortName: NullableStringField({}).optional(),
  skills: z.array(z.string()).optional(),
  slug: NullableStringField({}).optional(),
  visible: z.boolean().optional(),
});

export const RepositoryJsonSchema = MetaSchema.extend({
  /* This field is optional because it will be supplied via GitHub's API in the case that it is
     not defined in the fixture. */
  description: z.string().nullable().optional(),
  highlighted: z.boolean().optional(),
  npmPackageName: z.string().nullable().optional(),
  skills: z.array(z.string()),
  slug: z.string(),
  /* This field is optional because it will be supplied via GitHub's API in the case that it is
     not defined in the fixture. */
  startDate: z.coerce.date().optional(),
  visible: z.boolean().optional(),
});

export const ProjectJsonSchema = MetaSchema.extend({
  description: NonNullableStringField({}),
  highlighted: z.boolean().optional(),
  name: NonNullableStringField({}),
  repositories: z.array(z.string()).optional(),
  shortName: NullableStringField({}).optional(),
  skills: z.array(z.string()).optional(),
  slug: NullableStringField({}).optional(),
  startDate: z.coerce.date(),
  visible: z.boolean().optional(),
});

export const NestedDetailJsonSchema = MetaSchema.extend({
  description: NullableStringField({}).optional(),
  label: NonNullableStringField({}),
  project: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
});

export type JsonNestedDetail = z.infer<typeof NestedDetailJsonSchema>;

export const DetailJsonSchema = MetaSchema.extend({
  description: NullableStringField({}).optional(),
  label: NonNullableStringField({}),
  nestedDetails: z.array(NestedDetailJsonSchema).optional(),
  project: NullableStringField({}).optional(),
  skills: z.array(z.string()).optional(),
});

export type JsonDetail = z.infer<typeof DetailJsonSchema>;

export const ExperienceJsonSchema = MetaSchema.extend({
  description: NullableStringField({}).optional(),
  details: z.array(DetailJsonSchema).optional(),
  endDate: z.coerce.date().nullable().optional(),
  highlighted: z.boolean().optional(),
  isCurrent: z.boolean().optional(),
  isRemote: z.boolean().optional(),
  shortTitle: NullableStringField({}).optional(),
  skills: z.array(SkillReferenceJsonSchema).optional(),
  startDate: z.coerce.date(),
  title: NonNullableStringField({}),
  visible: z.boolean().optional(),
});

export const EducationJsonSchema = MetaSchema.extend({
  concentration: NullableStringField({}).optional(),
  courses: z.array(CourseJsonSchema).optional(),
  degree: z.nativeEnum(DegreeType),
  description: NullableStringField({}).optional(),
  details: z.array(DetailJsonSchema).optional(),
  endDate: z.coerce.date().nullable().optional(),
  highlighted: z.boolean().optional(),
  major: NonNullableStringField({}),
  minor: NullableStringField({}).optional(),
  note: NullableStringField({}).optional(),
  postPoned: z.boolean().optional(),
  shortMajor: NullableStringField({}).optional(),
  skills: z.array(SkillReferenceJsonSchema).optional(),
  startDate: z.coerce.date(),
  visible: z.boolean().optional(),
  websiteUrl: NullableStringField({}).optional(),
});

export const CompanyJsonSchema = MetaSchema.extend({
  city: NonNullableStringField({}),
  description: NullableStringField({}).optional(),
  experiences: z.array(ExperienceJsonSchema).optional(),
  logoImageUrl: NullableStringField({}).optional(),
  name: NonNullableStringField({}),
  shortName: NullableStringField({}).optional(),
  state: NonNullableStringField({}),
  websiteUrl: NullableStringField({}).optional(),
});

export const SchoolJsonSchema = MetaSchema.extend({
  city: NonNullableStringField({}),
  description: NullableStringField({}).optional(),
  educations: z.array(EducationJsonSchema).optional(),
  logoImageUrl: NullableStringField({}).optional(),
  name: NonNullableStringField({}),
  shortName: NullableStringField({}).optional(),
  state: NonNullableStringField({}),
  websiteUrl: NullableStringField({}).optional(),
});

export const ProfileJsonSchema = MetaSchema.extend({
  displayName: NonNullableStringField({}),
  emailAddress: NonNullableStringField({}),
  firstName: NonNullableStringField({}),
  githubUrl: NullableStringField({}),
  intro: NonNullableStringField({}),
  lastName: NonNullableStringField({}),
  linkedinUrl: NullableStringField({}),
  middleName: NullableStringField({}),
  phoneNumber: NullableStringField({}),
  profileImageUrl: NullableStringField({}),
  tagline: NullableStringField({}),
});

export const JsonSchemas = {
  company: CompanyJsonSchema,
  profile: ProfileJsonSchema,
  project: ProjectJsonSchema,
  repository: RepositoryJsonSchema,
  school: SchoolJsonSchema,
  skill: SkillJsonSchema,
} as const satisfies Record<types.JsonifiableModel, z.ZodObject<z.ZodRawShape>>;
