import { isUuid } from "~/lib/typeguards";
import { type ApiEducation, type EducationIncludes } from "~/prisma/model";

import { type GetEducationParams } from "~/actions/fetches/educations";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducation = <I extends EducationIncludes>(
  id: string | null,
  config: SWRConfig<ApiEducation<I>, GetEducationParams<I>>,
) =>
  useSWR<ApiEducation<I>, GetEducationParams<I>>(
    isUuid(id) ? `/api/educations/${id}` : null,
    config,
  );
