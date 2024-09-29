import type { ApiProject, ProjectIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type ProjectControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useProject = <I extends ProjectIncludes>(
  id: string,
  config: SWRConfig<ApiProject<I>, ProjectControls<I>>,
) =>
  useSWR<ApiProject<I>, ProjectControls<I>>(
    // TODO: Revisit the conditional here.
    isUuid(id) ? `/api/projects/${id}` : null,
    config,
  );
