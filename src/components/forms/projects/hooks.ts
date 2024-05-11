import { useForm } from "~/components/forms/generic/hooks/use-form";

import { ProjectFormSchema } from "./schema";

export const useProjectForm = () =>
  useForm({
    schema: ProjectFormSchema,
    defaultValues: {
      name: "",
      shortName: "",
      slug: "",
    },
  });
