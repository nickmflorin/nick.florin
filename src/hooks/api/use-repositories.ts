import { type ApiRepository, type RepositoryIncludes } from "~/prisma/model";

import { type GetRepositoriesParams } from "~/actions/fetches/repositories";

import { useSWR, type SWRConfig } from "./use-swr";

export const useRepositories = <I extends RepositoryIncludes>(
  config: SWRConfig<ApiRepository<I>[], GetRepositoriesParams<I>>,
) => useSWR<ApiRepository<I>[], GetRepositoriesParams<I>>("/api/repositories", config);
