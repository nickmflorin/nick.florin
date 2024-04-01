import { type z } from "zod";

import { type FullApiDetail, type NestedApiDetail } from "~/prisma/model";
import { DetailSchema } from "~/api/schemas";

export const DetailFormSchema = DetailSchema.omit({ visible: true });
export type DetailFormValues = z.infer<typeof DetailFormSchema>;

export type WithoutNestedDetails<D extends FullApiDetail | NestedApiDetail> =
  D extends FullApiDetail ? Omit<D, "nestedDetails"> : D;
