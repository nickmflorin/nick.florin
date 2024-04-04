import { isUuid } from "~/lib/typeguards";
import { encodeQueryParam } from "~/lib/urls";
import { type SkillIncludes, type ApiSkill } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkill = <I extends SkillIncludes>(
  id: string | null,
  { includes, ...config }: SWRConfig<ApiSkill<I>> & { readonly includes: I },
) => {
  console;
  return useSWR<ApiSkill<I>>(isUuid(id) ? `/api/skills/${id}` : null, {
    ...config,
    query: { ...config?.query, includes: encodeQueryParam(includes) },
  });
};
