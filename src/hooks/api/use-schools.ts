import type { ApiSchool, SchoolIncludes } from "~/database/model";

import { type FlattenedSchoolsControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSchools = <I extends SchoolIncludes>(
  config: SWRConfig<ApiSchool<I>[], Partial<FlattenedSchoolsControls<I>>>,
) => useSWR<ApiSchool<I>[], Partial<FlattenedSchoolsControls<I>>>("/api/schools", config);
