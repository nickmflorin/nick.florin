import { type ApiEducation } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./useSWR";

export const useEducations = (config?: SWRConfig<ApiEducation[]>) =>
  useSWR<ApiEducation[]>("/api/educations", config ?? {});
