import { type SchoolIncludes, type ApiSchool } from "~/prisma/model";
import { type Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSchools = <I extends SchoolIncludes>({
  includes,
  visibility,
  ...config
}: SWRConfig<ApiSchool<I>[]> & { readonly includes: I; readonly visibility: Visibility }) =>
  useSWR<ApiSchool<I>[]>("/api/schools", {
    ...config,
    query: {
      ...config.query,
      includes,
      visibility,
    },
  });
