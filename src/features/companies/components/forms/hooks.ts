import { useForm } from "~/components/forms-v2/hooks/use-form";

import { CompanyFormSchema } from "./schema";

export const useCompanyForm = () =>
  useForm({
    schema: CompanyFormSchema,
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
