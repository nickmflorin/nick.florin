import { isUuid } from "~/lib/typeguards";
import { type SkillIncludes, type ApiSkill } from "~/prisma/model";
import type { Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkill = <I extends SkillIncludes>(
  id: string | null,
  {
    includes,
    visibility,
    ...config
  }: SWRConfig<ApiSkill<I>> & { readonly includes: I; readonly visibility: Visibility },
) =>
  useSWR<ApiSkill<I>>(isUuid(id) ? `/api/skills/${id}` : null, {
    ...config,
    query: {
      ...config?.query,
      includes,
      visibility,
    },
  });
