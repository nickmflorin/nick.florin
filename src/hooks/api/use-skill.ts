import { type ApiSkill } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkill = (id: string, config?: SWRConfig<ApiSkill>) =>
  useSWR<ApiSkill>(`/api/skills/${id}`, config ?? {});
