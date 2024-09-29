import type { ApiEducation, EducationIncludes } from "~/database/model";

import { type FlattenedEducationsControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducations = <I extends EducationIncludes>(
  config: SWRConfig<ApiEducation<I>[], FlattenedEducationsControls<I>>,
) => useSWR<ApiEducation<I>[], FlattenedEducationsControls<I>>("/api/educations", config);
