import { type ApiRepository, type RepositoryIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useRepositories = <I extends RepositoryIncludes>({
  includes,
  visibility,
  ...config
}: SWRConfig<ApiRepository<I>[]> & { readonly includes: I; readonly visibility: Visibility }) =>
  useSWR<ApiRepository<I>[]>("/api/repositories", {
    ...config,
    query: {
      ...config.query,
      includes,
      visibility,
    },
  });
