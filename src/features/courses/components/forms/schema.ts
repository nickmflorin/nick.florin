import { type z } from "zod";

import { CourseSchema } from "~/actions/schemas";

export const CourseFormSchema = CourseSchema.required();

export type CourseFormValues = z.infer<typeof CourseFormSchema>;
