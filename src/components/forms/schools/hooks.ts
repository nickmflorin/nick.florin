import { SchoolSchema } from "~/api/schemas";

import { useForm } from "~/components/forms/generic/hooks/use-form";

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
