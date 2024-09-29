import type { ApiEducation, EducationIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type EducationControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducation = <I extends EducationIncludes>(
  id: string,
  config: SWRConfig<ApiEducation<I>, EducationControls<I>>,
) =>
  useSWR<ApiEducation<I>, EducationControls<I>>(
    // TODO: Revisit the conditional here.
    isUuid(id) ? `/api/educations/${id}` : null,
    config,
  );
