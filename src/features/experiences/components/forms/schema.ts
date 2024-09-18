import { type z } from "zod";

import { ExperienceSchema } from "~/actions-v2/schemas";

export const ExperienceFormSchema = ExperienceSchema.required();

export type ExperienceFormValues = z.infer<typeof ExperienceFormSchema>;
