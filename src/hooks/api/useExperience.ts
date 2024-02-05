import { type ApiExperience } from "~/prisma/model";

import { useSWR, type SWRConfig } from "../useSWR";

export const useExperience = (config?: SWRConfig<ApiExperience[]>) =>
  useSWR<ApiExperience[]>("/api/experience", config ?? {});
