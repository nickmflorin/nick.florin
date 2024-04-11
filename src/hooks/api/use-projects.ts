import { encodeQueryParam } from "~/lib/urls";
import { type Project, type ProjectIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useProjects = <I extends ProjectIncludes>({
  includes,
  visibility,
  ...config
}: SWRConfig<Project[]> & { readonly includes: I; readonly visibility: Visibility }) =>
  useSWR<Project[]>("/api/projects", {
    ...config,
    query: {
      ...config.query,
      includes: encodeQueryParam(includes),
      visibility: encodeQueryParam(visibility),
    },
  });
