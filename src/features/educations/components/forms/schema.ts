import { type z } from "zod";

import { EducationSchema } from "~/api/schemas";

export const EducationFormSchema = EducationSchema.required();

export type EducationFormValues = z.infer<typeof EducationFormSchema>;
