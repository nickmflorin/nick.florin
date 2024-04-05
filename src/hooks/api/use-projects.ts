import { encodeQueryParam } from "~/lib/urls";
import { type Project, type ProjectIncludes } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useProjects = <I extends ProjectIncludes>(
  config: SWRConfig<Project[]> & { readonly includes: I },
) =>
  useSWR<Project[]>("/api/projects", {
    ...config,
    query: { ...config.query, includes: encodeQueryParam(config.includes) },
  });
