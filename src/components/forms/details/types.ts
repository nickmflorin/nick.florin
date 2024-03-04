import { type z } from "zod";

import { type DetailsSchema } from "~/actions/schemas";

export type DetailsFormValues = z.infer<typeof DetailsSchema>;
