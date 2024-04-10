import { ExperienceSchema } from "~/api/schemas";
import { useForm } from "~/components/forms/generic/hooks/use-form";

export const useExperienceForm = () =>
  useForm({
    schema: ExperienceSchema.required(),
    defaultValues: {
      title: "",
      shortTitle: "",
      description: "",
      isRemote: false,
      startDate: new Date(),
      endDate: null,
    },
  });
