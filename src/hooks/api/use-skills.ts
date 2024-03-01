import { type ApiSkill } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkills = (config?: SWRConfig<ApiSkill[]>) =>
  useSWR<ApiSkill[]>("/api/skills", config ?? {});
