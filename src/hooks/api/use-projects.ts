import type { ApiProject, ProjectIncludes } from "~/database/model";

import { type FlattenedProjectsControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useProjects = <I extends ProjectIncludes>(
  config: SWRConfig<ApiProject<I>[], FlattenedProjectsControls<I>>,
) => useSWR<ApiProject<I>[], FlattenedProjectsControls<I>>("/api/projects", config);
