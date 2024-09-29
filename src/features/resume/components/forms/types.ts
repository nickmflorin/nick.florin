import { z } from "zod";

import { DetailSchema } from "~/actions/schemas";

export const DetailFormSchema = DetailSchema.omit({ visible: true }).required().extend({
  visible: z.boolean().optional(),
});

export const ExpandedDetailFormSchema = DetailSchema.required();

export type DetailFormValues = z.infer<typeof DetailFormSchema>;
