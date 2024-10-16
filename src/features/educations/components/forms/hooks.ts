import { Degree, type ApiEducation } from "~/database/model";

import { useForm } from "~/components/forms-v2/hooks/use-form";

import { EducationFormSchema } from "./schema";

interface UseEducationFormConfig {
  readonly education?: ApiEducation<["skills"]>;
}

export const useEducationForm = ({ education }: UseEducationFormConfig) =>
  useForm({
    schema: EducationFormSchema,
    defaultValues: {
      major: education?.major ?? "",
      degree: Degree.BACHELORS_OF_SCIENCE,
      concentration: education?.concentration ?? "",
      note: education?.note ?? "",
      minor: education?.minor ?? "",
      description: education?.description ?? "",
      postPoned: education?.postPoned ?? false,
      startDate: education?.startDate ?? new Date(),
      endDate: education?.endDate ?? null,
      visible: education?.visible ?? true,
      highlighted: education?.highlighted ?? false,
    },
  });
