import { useForm } from '~/components/forms-v2/hooks/use-form';

import { CompanyFormSchema } from './schema';

export const useCompanyForm = () =>
  useForm({
    defaultValues: {
      city: '',
      description: '',
      logoImageUrl: '',
      name: '',
      shortName: '',
      state: '',
      websiteUrl: '',
    },
    schema: CompanyFormSchema,
  });
