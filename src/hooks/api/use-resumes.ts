import { type ApiResume } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useResumes = (config?: SWRConfig<ApiResume<["primary"]>[]>) =>
  useSWR<ApiResume<["primary"]>[]>("/api/resumes", config ?? {});
