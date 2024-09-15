import type { ApiEducation } from "~/prisma/model";

import { useForm } from "~/components/forms/hooks/use-form";

import { EducationFormSchema } from "./schema";

interface UseEducationFormConfig {
  readonly education?: ApiEducation<["skills"]>;
}

export const useEducationForm = ({ education }: UseEducationFormConfig) =>
  useForm({
    schema: EducationFormSchema,
    defaultValues: {
      major: education?.major ?? "",
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
