import { type ApiRepository } from '~/database/model';

import { useForm } from '~/components/forms-v2/hooks/use-form';

import { RepositoryFormSchema } from './schema';

export const useRepositoryForm = (repository?: Partial<ApiRepository<['skills', 'projects']>>) =>
  useForm({
    defaultValues: {
      description: repository?.description ?? '',
      highlighted: repository?.highlighted ?? false,
      npmPackageName: repository?.npmPackageName ?? '',
      projects: repository?.projects ? repository.projects.map(p => p.id) : [],
      skills: repository?.skills ? repository.skills.map(sk => sk.id) : [],
      slug: repository?.slug ?? '',
      startDate: repository?.startDate ?? new Date(),
      visible: repository?.visible ?? false,
    },
    schema: RepositoryFormSchema,
  });
