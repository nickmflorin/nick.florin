import type { ApiRepository, RepositoryIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type RepositoryControls } from "~/actions-v2";

import { useSWR, type SWRConfig } from "./use-swr";

export const useRepository = <I extends RepositoryIncludes>(
  id: string,
  config: SWRConfig<ApiRepository<I>, Partial<RepositoryControls<I>>>,
) =>
  useSWR<ApiRepository<I>, Partial<RepositoryControls<I>>>(
    // TODO: Revisit the conditional here.
    isUuid(id) ? `/api/repositories/${id}` : null,
    config,
  );
