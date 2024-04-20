import { isUuid } from "~/lib/typeguards";
import { type ApiExperience, type ExperienceIncludes } from "~/prisma/model";
import { type GetExperienceParams } from "~/actions/fetches/experiences";

import { useSWR, type SWRConfig } from "./use-swr";

export const useExperience = <I extends ExperienceIncludes>(
  id: string | null,
  config: SWRConfig<ApiExperience<I>, GetExperienceParams<I>>,
) =>
  useSWR<ApiExperience<I>, GetExperienceParams<I>>(
    isUuid(id) ? `/api/experiences/${id}` : null,
    config,
  );
