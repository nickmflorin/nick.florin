import { z } from 'zod';

import {
  DegreeType,
  ProgrammingDomain,
  ProgrammingLanguage,
  SkillCategory,
} from '~/database/model';
import { NonNullableStringField, NullableStringField } from '~/lib/schemas';

export const SkillSchema = z.object({
  categories: z.array(z.nativeEnum(SkillCategory)).optional(),
  courses: z.array(z.string().uuid()).optional(),
  description: NullableStringField({
    min: 3,
    minErrorMessage: 'The description must be at least 3 characters.',
  }).optional(),
  educations: z.array(z.string().uuid()).optional(),
  experience: z.coerce
    /* eslint-disable-next-line camelcase -- The identifier is an option name defined by Zod's
       schema API. */
    .number({ invalid_type_error: 'The experience must be provided as a number.' })
    .int()
    .min(0)
    .nullable()
    .optional(),
  experiences: z.array(z.string().uuid()).optional(),
  highlighted: z.boolean().optional(),
  label: NonNullableStringField({
    min: 3,
    minErrorMessage: 'The label must be at least 3 characters.',
    requiredErrorMessage: 'The label is a required field.',
  }),
  prioritized: z.boolean().optional(),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)).optional(),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)).optional(),
  projects: z.array(z.string().uuid()).optional(),
  repositories: z.array(z.string().uuid()).optional(),
  slug: NullableStringField({
    min: 3,
    minErrorMessage: 'The slug must be at least 3 characters.',
  }).optional(),
  visible: z.boolean().optional(),
});

export const ExperienceSchema = z.object({
  company: z.string().uuid(),
  description: NullableStringField({
    min: 3,
    minErrorMessage: 'The description must be at least 3 characters.',
  }).optional(),
  endDate: z.date().nullable().optional(),
  highlighted: z.boolean().optional(),
  isCurrent: z.boolean().optional(),
  isRemote: z.boolean().optional(),
  shortTitle: NullableStringField({
    min: 3,
    minErrorMessage: 'The short title should be at least 3 characters.',
  }).optional(),
  skills: z.array(z.string().uuid()).optional(),
  startDate: z.date(),
  title: NonNullableStringField({
    min: 3,
    minErrorMessage: 'The title must be at least 3 characters.',
    requiredErrorMessage: 'The title is a required field.',
  }),
  visible: z.boolean().optional(),
});

export const EducationSchema = z.object({
  concentration: z.string().optional(),
  degree: z.nativeEnum(DegreeType),
  description: z.string().optional(),
  endDate: z.date().nullable().optional(),
  highlighted: z.boolean().optional(),
  major: NonNullableStringField({
    min: 3,
    minErrorMessage: 'The major must be at least 3 characters.',
    requiredErrorMessage: 'The major is a required field.',
  }),
  minor: z.string().optional(),
  note: z.string().optional(),
  postPoned: z.boolean().optional(),
  school: z.string().uuid(),
  shortMajor: NullableStringField({
    min: 2,
    minErrorMessage: 'The short major should be at least 3 characters.',
  }).optional(),
  skills: z.array(z.string().uuid()).optional(),
  startDate: z.date(),
  visible: z.boolean().optional(),
});

export const ProjectSchema = z.object({
  description: NonNullableStringField({
    min: 3,
    minErrorMessage: 'The description must be at least 3 characters.',
    requiredErrorMessage: 'The description is a required field.',
  }),
  details: z.array(z.string().uuid()).optional(),
  highlighted: z.boolean().optional(),
  name: NonNullableStringField({
    min: 3,
    minErrorMessage: 'The name must be at least 3 characters.',
    requiredErrorMessage: 'The name is a required field.',
  }),
  nestedDetails: z.array(z.string().uuid()).optional(),
  repositories: z.array(z.string().uuid()).optional(),
  shortName: NullableStringField({
    min: 2,
    minErrorMessage: 'The short name should be at least 2 characters.',
  }).optional(),
  skills: z.array(z.string().uuid()).optional(),
  slug: NullableStringField({
    min: 3,
    minErrorMessage: 'The slug must be at least 3 characters.',
  }).optional(),
  startDate: z.date(),
  visible: z.boolean().optional(),
});

export const RepositorySchema = z.object({
  description: NullableStringField({
    min: 3,
    minErrorMessage: 'The description must be at least 3 characters.',
  }),
  highlighted: z.boolean().optional(),
  npmPackageName: NullableStringField({
    min: 3,
    minErrorMessage: 'The npm package name must be at least 3 characters.',
  }),
  projects: z.array(z.string().uuid()).optional(),
  skills: z.array(z.string().uuid()).optional(),
  slug: NonNullableStringField({
    min: 3,
    minErrorMessage: 'The slug must be at least 3 characters.',
    requiredErrorMessage: 'The slug is a required field.',
  }),
  startDate: z.date(),
  visible: z.boolean().optional(),
});

export const CourseSchema = z.object({
  education: z
    /* eslint-disable-next-line camelcase -- The identifier is an option name defined by Zod's
       schema API. */
    .string({ required_error: 'The course must be associated with an educational experience.' })
    .uuid('The selected education has an invalid UUID.'),
  name: NonNullableStringField({
    min: 3,
    minErrorMessage: 'The name must be at least 3 characters.',
    requiredErrorMessage: 'The name is a required field.',
  }),
  shortName: NullableStringField({
    min: 2,
    minErrorMessage: 'The short name should be at least 3 characters.',
  }).optional(),
  skills: z.array(z.string().uuid()).optional(),
  slug: NullableStringField({
    min: 3,
    minErrorMessage: 'The slug must be at least 3 characters.',
  }).optional(),
  visible: z.boolean().optional(),
});

export const DetailSchema = z.object({
  description: NullableStringField({
    min: 3,
    minErrorMessage: 'The description must be at least 3 characters.',
  }).optional(),
  label: NonNullableStringField({
    min: 3,
    minErrorMessage: 'The label must be at least 3 characters.',
    requiredErrorMessage: 'The label is a required field.',
  }),
  project: z.string().uuid().nullable().optional(),
  shortDescription: NullableStringField({
    min: 3,
    minErrorMessage: 'The short description must be at least 3 characters.',
  }).optional(),
  skills: z.array(z.string().uuid()).optional(),
  visible: z.boolean().optional(),
});

const WebsiteUrlField = z
  .union([z.literal(null), z.literal(''), z.string().url()])
  .optional()
  .transform(v => (typeof v === 'string' && v.trim() === '' ? null : v));

const LogoImageUrlField = z
  .string()
  .nullable()
  .optional()
  .transform(v => (typeof v === 'string' && v.trim() === '' ? null : v));

export const CompanySchema = z.object({
  city: NonNullableStringField({
    min: 2,
    minErrorMessage: 'The city must be at least 2 characters.',
    requiredErrorMessage: 'The city is a required field.',
  }),
  description: NullableStringField({
    min: 3,
    minErrorMessage: 'The description must be at least 3 characters.',
  }).optional(),
  logoImageUrl: LogoImageUrlField,
  name: NonNullableStringField({
    min: 3,
    minErrorMessage: 'The name must be at least 3 characters.',
    requiredErrorMessage: 'The name is a required field.',
  }),
  shortName: NullableStringField({
    min: 3,
    minErrorMessage: 'The short name must be at least 3 characters.',
  }).optional(),
  state: NonNullableStringField({
    min: 2,
    minErrorMessage: 'The state must be at least 2 characters.',
    requiredErrorMessage: 'The state is a required field.',
  }),
  websiteUrl: WebsiteUrlField,
});

export const SchoolSchema = z.object({
  city: NonNullableStringField({
    min: 2,
    minErrorMessage: 'The city must be at least 2 characters.',
    requiredErrorMessage: 'The city is a required field.',
  }),
  description: NullableStringField({
    min: 3,
    minErrorMessage: 'The description must be at least 3 characters.',
  }).optional(),
  logoImageUrl: LogoImageUrlField,
  name: NonNullableStringField({
    min: 3,
    minErrorMessage: 'The name must be at least 3 characters.',
    requiredErrorMessage: 'The name is a required field.',
  }),
  shortName: NullableStringField({
    min: 3,
    minErrorMessage: 'The short name must be at least 3 characters.',
  }).optional(),
  state: NonNullableStringField({
    min: 2,
    minErrorMessage: 'The state must be at least 2 characters.',
    requiredErrorMessage: 'The state is a required field.',
  }),
  websiteUrl: WebsiteUrlField,
});

export const ResumeSchema = z.object({
  primary: z.boolean().optional(),
});
