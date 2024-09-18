"use client";
import { type z } from "zod";

import { ProjectSchema } from "~/actions-v2/schemas";

export const ProjectFormSchema = ProjectSchema.required().omit({
  visible: true,
  highlighted: true,
});

export type ProjectFormValues = z.infer<typeof ProjectFormSchema>;
