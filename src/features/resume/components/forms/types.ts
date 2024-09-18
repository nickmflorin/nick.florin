import { z } from "zod";

import { DetailSchema } from "~/actions-v2/schemas";

export const DetailFormSchema = DetailSchema.omit({ visible: true }).required().extend({
  visible: z.boolean().optional(),
});

export const ExpandedDetailFormSchema = DetailSchema.required();

export type DetailFormValues = z.infer<typeof DetailFormSchema>;
