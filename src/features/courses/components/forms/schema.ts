import { type z } from "zod";

import { CourseSchema } from "~/actions-v2/schemas";

export const CourseFormSchema = CourseSchema.required();

export type CourseFormValues = z.infer<typeof CourseFormSchema>;
