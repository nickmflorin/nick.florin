import { type Project } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useProjects = (config?: SWRConfig<Project[]>) =>
  useSWR<Project[]>("/api/projects", config ?? {});
