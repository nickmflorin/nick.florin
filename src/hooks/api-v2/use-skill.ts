import type { ApiSkill, SkillIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type SkillControls } from "~/actions-v2";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkill = <I extends SkillIncludes>(
  id: string,
  config: SWRConfig<ApiSkill<I>, SkillControls<I>>,
) =>
  useSWR<ApiSkill<I>, SkillControls<I>>(
    // TODO: Revisit the conditional here.
    isUuid(id) ? `/api/skills/${id}` : null,
    config,
  );
