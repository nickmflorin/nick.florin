import { isUuid } from "~/lib/typeguards";
import { type SkillIncludes, type ApiSkill } from "~/prisma/model";
import { encodeInclusionQuery } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkill = <I extends SkillIncludes>(
  id: string | null,
  includes: I,
  config?: SWRConfig<ApiSkill<I>>,
) =>
  useSWR<ApiSkill<I>>(isUuid(id) ? `/api/skills/${id}` : null, {
    ...config,
    query: { ...config?.query, includes: encodeInclusionQuery(includes) },
  });
