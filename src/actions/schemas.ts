import { z } from "zod";

import { NullableMinLengthStringField, NonNullableMinLengthStringField } from "~/lib/schemas";
import { Degree, ProgrammingDomain, ProgrammingLanguage, SkillCategory } from "~/prisma/model";

export const SkillSchema = z.object({
  label: z.string().min(3, "The label must be at least 3 characters."),
  slug: NullableMinLengthStringField({
    minErrorMessage: "The slug must be at least 3 characters.",
  }).optional(),
  description: NullableMinLengthStringField({
    minErrorMessage: "The description must be at least 3 characters.",
  }).optional(),
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
  title: NonNullableMinLengthStringField({
    min: 3,
    minErrorMessage: "The title must be at least 3 characters.",
    requiredErrorMessage: "The title is required.",
  }),
  shortTitle: NullableMinLengthStringField({
    min: 3,
    minErrorMessage: "The short title should be at least 3 characters.",
  }).optional(),
  description: NullableMinLengthStringField({
    minErrorMessage: "The description must be at least 3 characters.",
  }).optional(),
  company: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  isRemote: z.boolean().optional(),
});

export const EducationSchema = z.object({
  major: NonNullableMinLengthStringField({
    min: 3,
    minErrorMessage: "The major must be at least 3 characters.",
    requiredErrorMessage: "The major is required.",
  }),
  note: z.string().optional(),
  shortMajor: NullableMinLengthStringField({
    min: 2,
    minErrorMessage: "The short major should be at least 3 characters.",
  }).optional(),
  degree: z.nativeEnum(Degree),
  concentration: z.string().optional(),
  minor: z.string().optional(),
  description: z.string().optional(),
  school: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  postPoned: z.boolean().optional(),
});

export const DetailSchema = z.object({
  label: NonNullableMinLengthStringField({
    min: 3,
    minErrorMessage: "The label must be at least 3 characters.",
    requiredErrorMessage: "The label is required.",
  }),
  description: NullableMinLengthStringField({
    minErrorMessage: "The description must be at least 3 characters.",
  }).optional(),
  shortDescription: NullableMinLengthStringField({
    minErrorMessage: "The short description must be at least 3 characters.",
  }).optional(),
  visible: z.boolean(),
});

export const DetailsSchema = z.object({
  details: z.array(DetailSchema),
});
