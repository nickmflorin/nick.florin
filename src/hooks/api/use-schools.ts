import type { ApiSchool, SchoolIncludes } from "~/database/model";

import { type FlattenedSchoolsControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSchools = <I extends SchoolIncludes>(
  config: SWRConfig<ApiSchool<I>[], FlattenedSchoolsControls<I>>,
) => useSWR<ApiSchool<I>[], FlattenedSchoolsControls<I>>("/api/schools", config);
