import { SkillSchema } from '~/actions/schemas';

import { useForm } from '~/components/forms-v2/hooks/use-form';

export const useSkillForm = () =>
  useForm({
    defaultValues: {
      categories: [],
      courses: [],
      description: '',
      educations: [],
      experience: null,
      experiences: [],
      highlighted: false,
      label: '',
      prioritized: false,
      programmingDomains: [],
      programmingLanguages: [],
      projects: [],
      repositories: [],
      slug: '',
      visible: true,
    },
    schema: SkillSchema.required(),
  });
