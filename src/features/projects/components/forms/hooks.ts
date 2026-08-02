import { useForm } from '~/components/forms-v2/hooks/use-form';

import { ProjectFormSchema } from './schema';

export const useProjectForm = () =>
  useForm({
    defaultValues: {
      details: [],
      name: '',
      nestedDetails: [],
      repositories: [],
      shortName: '',
      skills: [],
      slug: '',
    },
    schema: ProjectFormSchema,
  });
