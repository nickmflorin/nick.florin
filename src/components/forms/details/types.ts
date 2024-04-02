import { type z } from "zod";

import { DetailSchema } from "~/api/schemas";

export const DetailFormSchema = DetailSchema.omit({ visible: true }).required();
export type DetailFormValues = z.infer<typeof DetailFormSchema>;
