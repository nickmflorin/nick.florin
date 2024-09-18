import { type z } from "zod";

import { EducationSchema } from "~/actions-v2/schemas";

export const EducationFormSchema = EducationSchema.required();

export type EducationFormValues = z.infer<typeof EducationFormSchema>;
