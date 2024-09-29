import { SchoolSchema } from "~/actions/schemas";

import { useForm } from "~/components/forms-v2/hooks/use-form";

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
