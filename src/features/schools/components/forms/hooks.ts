import { SchoolSchema } from '~/actions/schemas';

import { useForm } from '~/components/forms-v2/hooks/use-form';

export const useSchoolForm = () =>
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
    schema: SchoolSchema.required(),
  });
