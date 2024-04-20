import { isUuid } from "~/lib/typeguards";
import { type ApiRepository, type RepositoryIncludes } from "~/prisma/model";
import { type GetRepositoryParams } from "~/actions/fetches/repositories";

import { useSWR, type SWRConfig } from "./use-swr";

export const useRepository = <I extends RepositoryIncludes>(
  id: string | null,
  config: SWRConfig<ApiRepository<I>, GetRepositoryParams<I>>,
) =>
  useSWR<ApiRepository<I>, GetRepositoryParams<I>>(
    isUuid(id) ? `/api/repositories/${id}` : null,
    config,
  );
