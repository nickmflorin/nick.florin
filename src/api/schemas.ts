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
  projects: z.array(z.string().uuid()).optional(),
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
  visible: z.boolean().optional(),
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
  visible: z.boolean().optional(),
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
  project: z.string().uuid().nullable().optional(),
});

export const DetailsSchema = z.object({
  details: z.array(DetailSchema),
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
  name: NonNullableMinLengthStringField({
    min: 3,
    minErrorMessage: "The name must be at least 3 characters.",
    requiredErrorMessage: "The name is required.",
  }),
  shortName: NullableMinLengthStringField({
    minErrorMessage: "The short name must be at least 3 characters.",
  }).optional(),
  description: NullableMinLengthStringField({
    minErrorMessage: "The description must be at least 3 characters.",
  }).optional(),
  logoImageUrl: LogoImageUrlField,
  websiteUrl: WebsiteUrlField,
  city: NonNullableMinLengthStringField({
    min: 2,
    minErrorMessage: "The city must be at least 2 characters.",
    requiredErrorMessage: "The city is required.",
  }),
  state: NonNullableMinLengthStringField({
    min: 2,
    minErrorMessage: "The state must be at least 2 characters.",
    requiredErrorMessage: "The state is required.",
  }),
});

export const SchoolSchema = z.object({
  name: NonNullableMinLengthStringField({
    min: 3,
    minErrorMessage: "The name must be at least 3 characters.",
    requiredErrorMessage: "The name is required.",
  }),
  shortName: NullableMinLengthStringField({
    minErrorMessage: "The short name must be at least 3 characters.",
  }).optional(),
  description: NullableMinLengthStringField({
    minErrorMessage: "The description must be at least 3 characters.",
  }).optional(),
  logoImageUrl: LogoImageUrlField,
  websiteUrl: WebsiteUrlField,
  city: NonNullableMinLengthStringField({
    min: 2,
    minErrorMessage: "The city must be at least 2 characters.",
    requiredErrorMessage: "The city is required.",
  }),
  state: NonNullableMinLengthStringField({
    min: 2,
    minErrorMessage: "The state must be at least 2 characters.",
    requiredErrorMessage: "The state is required.",
  }),
});

type TopSkillNum = 5 | 8 | 12;

const showTopSkillsSchema = z
  .union([z.literal(5), z.literal(8), z.literal(12), z.enum(["5", "8", "12", "all"])])
  .transform((val): TopSkillNum | "all" =>
    typeof val === "string" && val !== "all" ? (parseInt(val) as TopSkillNum) : val,
  );

export type ShowTopSkills = z.infer<typeof showTopSkillsSchema>;

export const SHOW_TOP_SKILLS = [5, 8, 12, "all"] as const;
export const SHOW_TOP_SKILLS_STRINGS = ["5", "8", "12", "all"] as const;

export type ShowTopSkillsString = (typeof SHOW_TOP_SKILLS_STRINGS)[number];

export const SkillQuerySchema = z.object({
  includeInTopSkills: z.boolean().optional(),
  showTopSkills: showTopSkillsSchema.default(12),
  experiences: z.array(z.string().uuid()).optional(),
  educations: z.array(z.string().uuid()).optional(),
  programmingDomains: z.array(z.nativeEnum(ProgrammingDomain)).optional(),
  programmingLanguages: z.array(z.nativeEnum(ProgrammingLanguage)).optional(),
  categories: z.array(z.nativeEnum(SkillCategory)).optional(),
});

export type SkillQuery = z.infer<typeof SkillQuerySchema>;
