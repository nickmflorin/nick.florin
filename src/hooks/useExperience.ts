import { type Experience, type Company } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./useSWR";

export const useExperience = (config?: SWRConfig<(Experience & { readonly company: Company })[]>) =>
  useSWR<(Experience & { readonly company: Company })[]>("/api/experience", config);
