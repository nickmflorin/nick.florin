import type { ApiEducation, EducationIncludes } from "~/database/model";

import { type FlattenedEducationsControls } from "~/actions-v2";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducations = <I extends EducationIncludes>(
  config: SWRConfig<ApiEducation<I>[], Partial<FlattenedEducationsControls<I>>>,
) => useSWR<ApiEducation<I>[], Partial<FlattenedEducationsControls<I>>>("/api/educations", config);
