import { isUuid } from "~/lib/typeguards";
import { type SkillIncludes, type ApiSkill } from "~/prisma/model";
import type { GetSkillParams } from "~/actions/fetches/skills";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkill = <I extends SkillIncludes>(
  id: string | null,
  config: SWRConfig<ApiSkill<I>, GetSkillParams<I>>,
) => useSWR<ApiSkill<I>, GetSkillParams<I>>(isUuid(id) ? `/api/skills/${id}` : null, config);
