import { type ApiEducation, type EducationIncludes } from "~/database/model";

import { type GetEducationsParams } from "~/actions/fetches/educations";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducations = <I extends EducationIncludes>(
  config: SWRConfig<ApiEducation<I>[], GetEducationsParams<I>>,
) => useSWR<ApiEducation<I>[], GetEducationsParams<I>>("/api/educations", config);
