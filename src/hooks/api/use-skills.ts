import { encodeQueryParam } from "~/lib/urls";
import { type ApiSkill, type SkillIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkills = <I extends SkillIncludes>({
  includes,
  visibility,
  ...config
}: SWRConfig<ApiSkill<I>[]> & { readonly includes: I; readonly visibility: Visibility }) =>
  useSWR<ApiSkill<I>[]>("/api/skills", {
    ...config,
    query: {
      ...config?.query,
      includes: encodeQueryParam(includes),
      visibility: encodeQueryParam(visibility),
    },
  });
