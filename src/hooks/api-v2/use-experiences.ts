import type { ApiExperience, ExperienceIncludes } from "~/database/model";

import { type FlattenedExperiencesControls } from "~/actions-v2";

import { useSWR, type SWRConfig } from "./use-swr";

export const useExperiences = <I extends ExperienceIncludes>(
  config: SWRConfig<ApiExperience<I>[], Partial<FlattenedExperiencesControls<I>>>,
) =>
  useSWR<ApiExperience<I>[], Partial<FlattenedExperiencesControls<I>>>("/api/experiences", config);
