import { useForm } from '~/components/forms-v2/hooks/use-form';

import { CourseFormSchema } from './schema';

export const useCourseForm = () =>
  useForm({
    defaultValues: {
      name: '',
      shortName: null,
      skills: [],
      slug: null,
      visible: true,
    },
    schema: CourseFormSchema,
  });
