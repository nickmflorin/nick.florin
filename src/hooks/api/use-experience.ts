import type { ApiExperience, ExperienceIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type ExperienceControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useExperience = <I extends ExperienceIncludes>(
  id: string,
  config: SWRConfig<ApiExperience<I>, ExperienceControls<I>>,
) =>
  useSWR<ApiExperience<I>, ExperienceControls<I>>(
    // TODO: Revisit the conditional here.
    isUuid(id) ? `/api/experiences/${id}` : null,
    config,
  );
