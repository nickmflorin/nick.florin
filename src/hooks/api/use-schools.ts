import { type SchoolIncludes, type ApiSchool } from "~/prisma/model";

import { type GetSchoolsParams } from "~/actions/fetches/schools";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSchools = <I extends SchoolIncludes>(
  config: SWRConfig<ApiSchool<I>[], GetSchoolsParams<I>>,
) => useSWR<ApiSchool<I>[], GetSchoolsParams<I>>("/api/schools", config);
