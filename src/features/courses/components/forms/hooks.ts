import { useForm } from "~/components/forms/hooks/use-form";

import { CourseFormSchema } from "./schema";

export const useCourseForm = () =>
  useForm({
    schema: CourseFormSchema,
    defaultValues: {
      name: "",
      shortName: null,
      slug: null,
      skills: [],
      visible: true,
    },
  });
