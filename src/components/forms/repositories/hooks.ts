import { ProjectSchema } from "~/api/schemas";
import { useForm } from "~/components/forms/generic/hooks/use-form";

export const useProjectForm = () =>
  useForm({
    schema: ProjectSchema.required(),
    defaultValues: {
      name: "",
      shortName: "",
      slug: "",
    },
  });
