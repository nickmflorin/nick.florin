import { isUuid } from "~/lib/typeguards";
import { type SchoolIncludes, type ApiSchool } from "~/prisma/model";

import { type GetSchoolParams } from "~/actions/fetches/schools";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSchool = <I extends SchoolIncludes>(
  id: string | null,
  config: SWRConfig<ApiSchool<I>, GetSchoolParams<I>>,
) => useSWR<ApiSchool<I>, GetSchoolParams<I>>(isUuid(id) ? `/api/schools/${id}` : null, config);
