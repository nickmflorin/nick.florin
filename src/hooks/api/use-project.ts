import { isUuid } from "~/lib/typeguards";
import { encodeQueryParam } from "~/lib/urls";
import { type ApiProject, type ProjectIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useProject = <I extends ProjectIncludes>(
  id: string | null,
  {
    includes,
    visibility,
    ...config
  }: SWRConfig<ApiProject<I>> & {
    readonly includes: I;
    readonly visibility: Visibility;
  },
) =>
  useSWR<ApiProject<I>>(isUuid(id) ? `/api/projects/${id}` : null, {
    ...config,
    query: {
      ...config.query,
      includes: encodeQueryParam(includes),
      visibility: encodeQueryParam(visibility),
    },
  });
