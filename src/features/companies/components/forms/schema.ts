import { type z } from "zod";

import { CompanySchema } from "~/actions-v2/schemas";

export const CompanyFormSchema = CompanySchema.required();

export type CompanyFormValues = z.infer<typeof CompanyFormSchema>;
