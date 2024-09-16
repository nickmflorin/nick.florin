import { type z } from "zod";

import { ExperienceSchema } from "~/api/schemas";

export const ExperienceFormSchema = ExperienceSchema.required();

export type ExperienceFormValues = z.infer<typeof ExperienceFormSchema>;
