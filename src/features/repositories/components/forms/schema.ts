"use client";
import { type z } from "zod";

import { RepositorySchema } from "~/actions/schemas";

export const RepositoryFormSchema = RepositorySchema.required();

export type RepositoryFormValues = z.infer<typeof RepositoryFormSchema>;
