import { type ApiSkill, type SkillIncludes } from "~/prisma/model";
import { encodeInclusionQuery } from "~/api/inclusion";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkills = <I extends SkillIncludes>(
  includes: I,
  config?: SWRConfig<ApiSkill<I>[]>,
) =>
  useSWR<ApiSkill<I>[]>("/api/skills", {
    ...config,
    query: { ...config?.query, includes: encodeInclusionQuery(includes) },
  });
