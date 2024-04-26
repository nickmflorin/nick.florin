import { z } from "zod";

import { NullableStringField, NonNullableStringField } from "~/lib/schemas";
import { Degree, ProgrammingDomain, ProgrammingLanguage, SkillCategory } from "~/prisma/model";

export const SkillSchema = z.object({
  label: NonNullableStringField({
    min: 3,
    minErrorMessage: "The label must be at least 3 characters.",
    requiredErrorMessage: "The label is a required field.",
  }),
  slug: NullableStringField({
    min: 3,
    minErrorMessage: "The slug must be at least 3 characters.",
  }).optional(),
  description: NullableStringField({
    min: 3,
    minErrorMessage: "The description must be at least 3 characters.",
  }).optional(),
  experiences: z.array(z.string().uuid()).optional(),
  educations: z.array(z.string().uuid()).optional(),
  projects: z.array(z.string().uuid()).optional(),
  repositories: z.array(z.string().uuid()).optional(),
  includeInTopSkills: z.boolean().optional(),
  experience: z.number().nullable().optional(),
  visible: z.boolean().optional(),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)).optional(),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)).optional(),
  categories: z.array(z.nativeEnum(SkillCategory)).optional(),
});

export const ExperienceSchema = z.object({
  title: NonNullableStringField({
    min: 3,
    minErrorMessage: "The title must be at least 3 characters.",
    requiredErrorMessage: "The title is a required field.",
  }),
  shortTitle: NullableStringField({
    min: 3,
    minErrorMessage: "The short title should be at least 3 characters.",
  }).optional(),
  description: NullableStringField({
    min: 3,
    minErrorMessage: "The description must be at least 3 characters.",
  }).optional(),
  company: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
  isRemote: z.boolean().optional(),
  visible: z.boolean().optional(),
  skills: z.array(z.string().uuid()).optional(),
});

export const EducationSchema = z.object({
  major: NonNullableStringField({
    min: 3,
    minErrorMessage: "The major must be at least 3 characters.",
    requiredErrorMessage: "The major is a required field.",
  }),
  note: z.string().optional(),
  shortMajor: NullableStringField({
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
  visible: z.boolean().optional(),
  skills: z.array(z.string().uuid()).optional(),
});

export const ProjectSchema = z.object({
  name: NonNullableStringField({
    min: 3,
    minErrorMessage: "The name must be at least 3 characters.",
    requiredErrorMessage: "The name is a required field.",
  }),
  // TODO: We need to figure out how to add better validation here.
  icon: NonNullableStringField({
    min: 3,
    minErrorMessage: "The icon must be at least 3 characters.",
    requiredErrorMessage: "The icon is a required field.",
  }),
  shortName: NullableStringField({
    min: 2,
    minErrorMessage: "The short name should be at least 2 characters.",
  }).optional(),
  description: NonNullableStringField({
    min: 3,
    minErrorMessage: "The description must be at least 3 characters.",
    requiredErrorMessage: "The description is a required field.",
  }),
  slug: NullableStringField({
    min: 3,
    minErrorMessage: "The slug must be at least 3 characters.",
  }).optional(),
  startDate: z.date(),
  repositories: z.array(z.string().uuid()).optional(),
  /* These still need to be incorporated.  We may also eventually want to figure out how to allow
     details to be modified or specified when updating or creating a project. */
  skills: z.array(z.string().uuid()).optional(),
  details: z.array(z.string().uuid()).optional(),
  nestedDetails: z.array(z.string().uuid()).optional(),
});

export const RepositorySchema = z.object({
  slug: NonNullableStringField({
    min: 3,
    minErrorMessage: "The slug must be at least 3 characters.",
    requiredErrorMessage: "The slug is a required field.",
  }),
  description: NonNullableStringField({
    min: 3,
    minErrorMessage: "The description must be at least 3 characters.",
    requiredErrorMessage: "The description is a required field.",
  }),
  visible: z.boolean().optional(),
  projects: z.array(z.string().uuid()).optional(),
  skills: z.array(z.string().uuid()).optional(),
});

export const CourseSchema = z.object({
  name: NonNullableStringField({
    min: 3,
    minErrorMessage: "The name must be at least 3 characters.",
    requiredErrorMessage: "The name is a required field.",
  }),
  shortName: NullableStringField({
    min: 2,
    minErrorMessage: "The short name should be at least 3 characters.",
  }).optional(),
  slug: NullableStringField({
    min: 3,
    minErrorMessage: "The slug must be at least 3 characters.",
  }).optional(),
  education: z
    .string({ required_error: "The course must be associated with an educational experience." })
    .uuid("The selected education has an invalid UUID."),
  skills: z.array(z.string().uuid()).optional(),
  visible: z.boolean().optional(),
});

export const DetailSchema = z.object({
  label: NonNullableStringField({
    min: 3,
    minErrorMessage: "The label must be at least 3 characters.",
    requiredErrorMessage: "The label is a required field.",
  }),
  description: NullableStringField({
    min: 3,
    minErrorMessage: "The description must be at least 3 characters.",
  }).optional(),
  shortDescription: NullableStringField({
    min: 3,
    minErrorMessage: "The short description must be at least 3 characters.",
  }).optional(),
  visible: z.boolean().optional(),
  project: z.string().uuid().nullable().optional(),
  skills: z.array(z.string().uuid()).optional(),
});

const WebsiteUrlField = z
  .union([z.literal(null), z.literal(""), z.string().url()])
  .optional()
  .transform(v => (typeof v === "string" && v.trim() === "" ? null : v));

const LogoImageUrlField = z
  .string()
  .nullable()
  .optional()
  .transform(v => (typeof v === "string" && v.trim() === "" ? null : v));

export const CompanySchema = z.object({
  name: NonNullableStringField({
    min: 3,
    minErrorMessage: "The name must be at least 3 characters.",
    requiredErrorMessage: "The name is a required field.",
  }),
  shortName: NullableStringField({
    min: 3,
    minErrorMessage: "The short name must be at least 3 characters.",
  }).optional(),
  description: NullableStringField({
    min: 3,
    minErrorMessage: "The description must be at least 3 characters.",
  }).optional(),
  logoImageUrl: LogoImageUrlField,
  websiteUrl: WebsiteUrlField,
  city: NonNullableStringField({
    min: 2,
    minErrorMessage: "The city must be at least 2 characters.",
    requiredErrorMessage: "The city is a required field.",
  }),
  state: NonNullableStringField({
    min: 2,
    minErrorMessage: "The state must be at least 2 characters.",
    requiredErrorMessage: "The state is a required field.",
  }),
});

export const SchoolSchema = z.object({
  name: NonNullableStringField({
    min: 3,
    minErrorMessage: "The name must be at least 3 characters.",
    requiredErrorMessage: "The name is a required field.",
  }),
  shortName: NullableStringField({
    min: 3,
    minErrorMessage: "The short name must be at least 3 characters.",
  }).optional(),
  description: NullableStringField({
    min: 3,
    minErrorMessage: "The description must be at least 3 characters.",
  }).optional(),
  logoImageUrl: LogoImageUrlField,
  websiteUrl: WebsiteUrlField,
  city: NonNullableStringField({
    min: 2,
    minErrorMessage: "The city must be at least 2 characters.",
    requiredErrorMessage: "The city is a required field.",
  }),
  state: NonNullableStringField({
    min: 2,
    minErrorMessage: "The state must be at least 2 characters.",
    requiredErrorMessage: "The state is a required field.",
  }),
});
