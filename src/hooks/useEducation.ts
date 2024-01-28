import { type ApiEducation } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./useSWR";

export const useEducation = (config?: SWRConfig<ApiEducation[]>) =>
  useSWR<ApiEducation[]>("/api/education", config ?? {});
