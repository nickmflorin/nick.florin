import { CourseSchema } from "~/api/schemas";
import { useForm } from "~/components/forms/generic/hooks/use-form";

export const useCourseForm = () =>
  useForm({
    schema: CourseSchema.required(),
    defaultValues: {
      name: "",
      shortName: "",
      slug: "",
    },
  });
