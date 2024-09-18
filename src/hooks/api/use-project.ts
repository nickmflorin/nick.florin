import { type ApiProject, type ProjectIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type GetProjectParams } from "~/actions/fetches/projects";

import { useSWR, type SWRConfig } from "./use-swr";

export const useProject = <I extends ProjectIncludes>(
  id: string | null,
  config: SWRConfig<ApiProject<I>, GetProjectParams<I>>,
) => useSWR<ApiProject<I>, GetProjectParams<I>>(isUuid(id) ? `/api/projects/${id}` : null, config);
