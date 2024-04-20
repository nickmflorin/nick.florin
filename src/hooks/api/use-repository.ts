import { isUuid } from "~/lib/typeguards";
import { type ApiRepository, type RepositoryIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useRepository = <I extends RepositoryIncludes>(
  id: string | null,
  {
    includes,
    visibility,
    ...config
  }: SWRConfig<ApiRepository<I>> & {
    readonly includes: I;
    readonly visibility: Visibility;
  },
) =>
  useSWR<ApiRepository<I>>(isUuid(id) ? `/api/repositories/${id}` : null, {
    ...config,
    query: {
      ...config.query,
      includes,
      visibility,
    },
  });
