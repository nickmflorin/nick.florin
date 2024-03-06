import { type z } from "zod";

import { type FullDetail, type NestedDetail } from "~/prisma/model";
import { DetailSchema } from "~/actions/schemas";

export const DetailFormSchema = DetailSchema.omit({ visible: true });
export type DetailFormValues = z.infer<typeof DetailFormSchema>;

export type WithoutNestedDetails<D extends FullDetail | NestedDetail> = D extends FullDetail
  ? Omit<D, "nestedDetails">
  : D;
