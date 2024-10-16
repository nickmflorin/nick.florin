import type { BrandResume } from "~/database/model";

import { type FlattenedResumesControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useResumes = (config: SWRConfig<BrandResume[], FlattenedResumesControls>) =>
  useSWR<BrandResume[], FlattenedResumesControls>("/api/resumes", config);
