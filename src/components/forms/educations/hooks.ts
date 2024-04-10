import { EducationSchema } from "~/api/schemas";
import { useForm } from "~/components/forms/generic/hooks/use-form";

export const useEducationForm = () =>
  useForm({
    schema: EducationSchema.required(),
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
