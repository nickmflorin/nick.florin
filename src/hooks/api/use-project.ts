import { isUuid } from "~/lib/typeguards";
import { type Project } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useProject = (id: string | null, config?: SWRConfig<Project>) =>
  useSWR<Project>(isUuid(id) ? `/api/projects/${id}` : null, config ?? {});
