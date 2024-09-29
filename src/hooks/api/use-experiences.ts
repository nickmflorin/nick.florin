import type { ApiExperience, ExperienceIncludes } from "~/database/model";

import { type FlattenedExperiencesControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useExperiences = <I extends ExperienceIncludes>(
  config: SWRConfig<ApiExperience<I>[], FlattenedExperiencesControls<I>>,
) => useSWR<ApiExperience<I>[], FlattenedExperiencesControls<I>>("/api/experiences", config);
