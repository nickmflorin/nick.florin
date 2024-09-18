import { SchoolSchema } from "~/actions-v2/schemas";

import { useForm } from "~/components/forms/hooks/use-form";

export const useSchoolForm = () =>
  useForm({
    schema: SchoolSchema.required(),
    defaultValues: {
      name: "",
      shortName: "",
      description: "",
      websiteUrl: "",
      logoImageUrl: "",
      city: "",
      state: "",
    },
  });
