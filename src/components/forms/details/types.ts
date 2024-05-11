import { z } from "zod";

import { DetailSchema } from "~/api/schemas";

export const DetailFormSchema = DetailSchema.omit({ visible: true, skills: true })
  .required()
  .extend({
    visible: z.boolean().optional(),
    skills: z.array(
      z.object({
        id: z.string(),
        value: z.string(),
        label: z.string(),
      }),
    ),
  });

export const ExpandedDetailFormSchema = DetailSchema.required();

export type DetailFormValues = z.infer<typeof DetailFormSchema>;
