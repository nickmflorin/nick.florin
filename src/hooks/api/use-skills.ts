import { type ApiSkill, type SkillIncludes } from "~/prisma/model";

import type { GetSkillsParams } from "~/actions/fetches/skills";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkills = <I extends SkillIncludes, Q extends GetSkillsParams<I>>(
  config: SWRConfig<ApiSkill<I>[], Q>,
) => useSWR<ApiSkill<I>[], Q>("/api/skills", config);
