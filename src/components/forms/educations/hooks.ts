import { useForm } from "~/components/forms/generic/hooks/use-form";

import { EducationFormSchema } from "./schema";

export const useEducationForm = () =>
  useForm({
    schema: EducationFormSchema,
    defaultValues: {
      major: "",
      concentration: "",
      note: "",
      minor: "",
      description: "",
      postPoned: false,
      startDate: new Date(),
      endDate: null,
    },
  });
