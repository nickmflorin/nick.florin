import { type ApiEducation, DegreeType } from '~/database/model';

import { useForm } from '~/components/forms-v2/hooks/use-form';

import { EducationFormSchema } from './schema';

interface UseEducationFormConfig {
  readonly education?: ApiEducation<['skills']>;
}

export const useEducationForm = ({ education }: UseEducationFormConfig) =>
  useForm({
    defaultValues: {
      concentration: education?.concentration ?? '',
      degree: DegreeType.BACHELORS_OF_SCIENCE,
      description: education?.description ?? '',
      endDate: education?.endDate ?? null,
      highlighted: education?.highlighted ?? false,
      major: education?.major ?? '',
      minor: education?.minor ?? '',
      note: education?.note ?? '',
      postPoned: education?.postPoned ?? false,
      startDate: education?.startDate ?? new Date(),
      visible: education?.visible ?? true,
    },
    schema: EducationFormSchema,
  });
