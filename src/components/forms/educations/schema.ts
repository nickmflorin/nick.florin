import { z } from "zod";

import { EducationSchema } from "~/api/schemas";

export const EducationFormSchema = EducationSchema.required()
  .omit({ skills: true })
  .extend({
    skills: z.array(
      z.object({
        id: z.string(),
        value: z.string(),
        label: z.string(),
      }),
    ),
  });

export type EducationFormValues = z.infer<typeof EducationFormSchema>;
