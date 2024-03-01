import { type ApiEducation } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducations = (config?: SWRConfig<ApiEducation[]>) =>
  useSWR<ApiEducation[]>("/api/educations", config ?? {});
