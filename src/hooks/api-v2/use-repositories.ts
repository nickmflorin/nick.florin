import type { ApiRepository, RepositoryIncludes } from "~/database/model";

import { type FlattenedRepositoriesControls } from "~/actions-v2";

import { useSWR, type SWRConfig } from "./use-swr";

export const useRepositories = <I extends RepositoryIncludes>(
  config: SWRConfig<ApiRepository<I>[], Partial<FlattenedRepositoriesControls<I>>>,
) =>
  useSWR<ApiRepository<I>[], Partial<FlattenedRepositoriesControls<I>>>(
    "/api/repositories",
    config,
  );
