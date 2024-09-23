import type { ApiSkill, SkillIncludes } from "~/database/model";

import { type FlattenedSkillsControls } from "~/actions-v2";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkills = <I extends SkillIncludes>(
  config: SWRConfig<ApiSkill<I>[], Partial<FlattenedSkillsControls<I>>>,
) => useSWR<ApiSkill<I>[], Partial<FlattenedSkillsControls<I>>>("/api/skills", config);
