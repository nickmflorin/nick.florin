import { CompanySchema } from "~/api/schemas";
import { useForm } from "~/components/forms/generic/hooks/use-form";

export const useCompanyForm = () =>
  useForm({
    schema: CompanySchema.required(),
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
