import { useForm } from "~/components/forms/hooks/use-form";

import { ProjectFormSchema } from "./schema";

export const useProjectForm = () =>
  useForm({
    schema: ProjectFormSchema,
    defaultValues: {
      name: "",
      shortName: "",
      slug: "",
      repositories: [],
      skills: [],
      details: [],
      nestedDetails: [],
    },
  });