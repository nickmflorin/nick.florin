import { type ApiSkill, type SkillIncludes } from "~/prisma/model";
import { encodeInclusionQuery } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkills = <I extends SkillIncludes>({
  includes,
  ...config
}: SWRConfig<ApiSkill<I>[]> & { readonly includes: I }) =>
  useSWR<ApiSkill<I>[]>("/api/skills", {
    ...config,
    query: { ...config?.query, includes: encodeInclusionQuery(includes) },
  });
