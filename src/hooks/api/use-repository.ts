import type { ApiRepository, RepositoryIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type RepositoryControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useRepository = <I extends RepositoryIncludes>(
  id: string,
  config: SWRConfig<ApiRepository<I>, RepositoryControls<I>>,
) =>
  useSWR<ApiRepository<I>, RepositoryControls<I>>(
    // TODO: Revisit the conditional here.
    isUuid(id) ? `/api/repositories/${id}` : null,
    config,
  );
