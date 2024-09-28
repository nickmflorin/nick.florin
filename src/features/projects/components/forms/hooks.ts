import { useForm } from "~/components/forms-v2/hooks/use-form";

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
