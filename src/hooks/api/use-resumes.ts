import { type BrandResume } from "~/database/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useResumes = (config: SWRConfig<BrandResume[]>) =>
  useSWR<BrandResume[]>("/api/resumes", config);
