import { type z } from "zod";

import { DetailSchema } from "~/actions/schemas";

export const DetailFormSchema = DetailSchema.omit({ visible: true });
export type DetailFormValues = z.infer<typeof DetailFormSchema>;
