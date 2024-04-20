import { type ApiSkill, type SkillIncludes } from "~/prisma/model";
import type { GetSkillsParams } from "~/actions/fetches/skills";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkills = <I extends SkillIncludes>(
  config: SWRConfig<ApiSkill<I>[], GetSkillsParams<I>>,
) => useSWR<ApiSkill<I>[], GetSkillsParams<I>>("/api/skills", config);
