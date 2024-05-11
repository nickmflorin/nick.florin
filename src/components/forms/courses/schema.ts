import { z } from "zod";

import { CourseSchema } from "~/api/schemas";

export const CourseFormSchema = CourseSchema.required()
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

export type CourseFormValues = z.infer<typeof CourseFormSchema>;
