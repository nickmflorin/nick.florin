import { isUuid } from "~/lib/typeguards";
import { type ApiSkill } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkill = (id: string | null, config?: SWRConfig<ApiSkill>) =>
  useSWR<ApiSkill>(isUuid(id) ? `/api/skills/${id}` : null, config ?? {});
