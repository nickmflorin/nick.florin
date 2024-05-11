"use client";
import { z } from "zod";

import { ProjectSchema } from "~/api/schemas";

export const ProjectFormSchema = ProjectSchema.required()
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

export type ProjectFormValues = z.infer<typeof ProjectFormSchema>;
