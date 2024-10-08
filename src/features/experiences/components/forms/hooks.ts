import type { ApiExperience } from "~/database/model";

import { useForm } from "~/components/forms-v2/hooks/use-form";

import { ExperienceFormSchema } from "./schema";

interface UseExperienceFormConfig {
  readonly experience?: ApiExperience<["skills"]>;
}

export const useExperienceForm = ({ experience }: UseExperienceFormConfig) =>
  useForm({
    schema: ExperienceFormSchema,
    defaultValues: {
      title: experience?.title ?? "",
      shortTitle: experience?.shortTitle ?? "",
      description: experience?.description ?? "",
      isRemote: experience?.isRemote ?? false,
      startDate: experience?.startDate ?? new Date(),
      endDate: experience?.endDate ?? null,
      skills: experience?.skills.map(sk => sk.id) ?? [],
      visible: experience?.visible ?? true,
      highlighted: experience?.highlighted ?? false,
      isCurrent: experience?.isCurrent ?? false,
    },
  });
