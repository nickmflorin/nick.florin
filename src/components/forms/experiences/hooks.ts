import { useForm } from "~/components/forms/generic/hooks/use-form";

import { ExperienceFormSchema } from "./schema";

export const useExperienceForm = () =>
  useForm({
    schema: ExperienceFormSchema,
    defaultValues: {
      title: "",
      shortTitle: "",
      description: "",
      isRemote: false,
      startDate: new Date(),
      endDate: null,
    },
  });
