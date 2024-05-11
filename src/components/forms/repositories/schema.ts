"use client";
import { z } from "zod";

import { RepositorySchema } from "~/api/schemas";

export const RepositoryFormSchema = RepositorySchema.required()
  .omit({ skills: true })
  .extend({
    skills: z.array(
      z.object({
        id: z.string(),
        value: z.string(),
        label: z.string(),
      }),
    ),
  });

export type RepositoryFormValues = z.infer<typeof RepositoryFormSchema>;
