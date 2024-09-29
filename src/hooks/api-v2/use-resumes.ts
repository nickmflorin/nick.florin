import type { BrandResume } from "~/database/model";

import { type FlattenedResumesControls } from "~/actions-v2";

import { useSWR, type SWRConfig } from "./use-swr";

export const useResumes = (config: SWRConfig<BrandResume[], Partial<FlattenedResumesControls>>) =>
  useSWR<BrandResume[], Partial<FlattenedResumesControls>>("/api/resumes", config);
