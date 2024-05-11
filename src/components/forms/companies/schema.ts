import { type z } from "zod";

import { CompanySchema } from "~/api/schemas";

export const CompanyFormSchema = CompanySchema.required();

export type CompanyFormValues = z.infer<typeof CompanyFormSchema>;
