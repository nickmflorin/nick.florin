import { type ApiExperience, type ExperienceIncludes } from "~/database/model";

import { type GetExperiencesParams } from "~/actions/fetches/experiences";

import { useSWR, type SWRConfig } from "./use-swr";

export const useExperiences = <I extends ExperienceIncludes>(
  config: SWRConfig<ApiExperience<I>[], GetExperiencesParams<I>>,
) => useSWR<ApiExperience<I>[], GetExperiencesParams<I>>("/api/experiences", config);
