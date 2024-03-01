import { type School } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSchools = (config?: SWRConfig<School[]>) =>
  useSWR<School[]>("/api/schools", config ?? {});
