import { isUuid } from "~/lib/typeguards";
import { type SchoolIncludes, type ApiSchool } from "~/prisma/model";
import type { Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSchool = <I extends SchoolIncludes>(
  id: string | null,
  {
    includes,
    visibility,
    ...config
  }: SWRConfig<ApiSchool<I>> & { readonly visibility: Visibility; readonly includes: I },
) =>
  useSWR<ApiSchool<I>>(isUuid(id) ? `/api/schools/${id}` : null, {
    ...config,
    query: {
      ...config.query,
      includes,
      visibility,
    },
  });
