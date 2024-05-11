import { z } from "zod";

import { ExperienceSchema } from "~/api/schemas";

export const ExperienceFormSchema = ExperienceSchema.required()
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

export type ExperienceFormValues = z.infer<typeof ExperienceFormSchema>;
