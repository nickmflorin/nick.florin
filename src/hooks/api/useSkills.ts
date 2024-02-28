import { type ApiSkill } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./useSWR";

export const useSkills = (config?: SWRConfig<ApiSkill[]>) =>
  useSWR<ApiSkill[]>("/api/skills", config ?? {});
