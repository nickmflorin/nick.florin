import { type ApiExperience } from "~/prisma/model";

import { useSWR, type SWRConfig } from "../useSWR";

export const useExperiences = (config?: SWRConfig<ApiExperience[]>) =>
  useSWR<ApiExperience[]>("/api/experiences", config ?? {});
