import type { ApiSkill, SkillIncludes } from "~/database/model";

import { type FlattenedSkillsControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkills = <I extends SkillIncludes>(
  config: SWRConfig<ApiSkill<I>[], FlattenedSkillsControls<I>>,
) => useSWR<ApiSkill<I>[], FlattenedSkillsControls<I>>("/api/skills", config);
