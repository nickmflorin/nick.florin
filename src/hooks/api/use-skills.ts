import { type ApiSkill, type SkillIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";
import type { SkillsFilters } from "~/api/schemas";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSkills = <I extends SkillIncludes>({
  includes,
  visibility,
  limit,
  filters,
  ...config
}: SWRConfig<ApiSkill<I>[]> & {
  readonly includes: I;
  readonly visibility: Visibility;
  readonly limit?: number;
  readonly filters?: SkillsFilters;
}) =>
  useSWR<ApiSkill<I>[]>("/api/skills", {
    ...config,
    query: {
      ...config?.query,
      limit,
      filters,
      visibility,
      includes,
    },
  });
