import { type ApiProject, type ProjectIncludes } from "~/prisma/model";

import { type GetProjectsParams } from "~/actions/fetches/projects";

import { useSWR, type SWRConfig } from "./use-swr";

export const useProjects = <I extends ProjectIncludes>(
  config: SWRConfig<ApiProject<I>[], GetProjectsParams<I>>,
) => useSWR<ApiProject<I>[], GetProjectsParams<I>>("/api/projects", config);
