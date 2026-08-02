import { type ApiExperience } from '~/database/model';

import { useForm } from '~/components/forms-v2/hooks/use-form';

import { ExperienceFormSchema } from './schema';

interface UseExperienceFormConfig {
  readonly experience?: ApiExperience<['skills']>;
}

export const useExperienceForm = ({ experience }: UseExperienceFormConfig) =>
  useForm({
    defaultValues: {
      description: experience?.description ?? '',
      endDate: experience?.endDate ?? null,
      highlighted: experience?.highlighted ?? false,
      isCurrent: experience?.isCurrent ?? false,
      isRemote: experience?.isRemote ?? false,
      shortTitle: experience?.shortTitle ?? '',
      skills: experience?.skills.map(sk => sk.id) ?? [],
      startDate: experience?.startDate ?? new Date(),
      title: experience?.title ?? '',
      visible: experience?.visible ?? true,
    },
    schema: ExperienceFormSchema,
  });
