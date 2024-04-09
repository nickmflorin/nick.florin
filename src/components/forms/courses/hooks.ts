import { useForm } from "~/components/forms/generic/hooks/use-form";

import { CourseFormSchema } from "./CourseForm";

export const useCourseForm = () =>
  useForm({
    schema: CourseFormSchema,
    defaultValues: {
      name: "",
      shortName: "",
      slug: "",
    },
  });
