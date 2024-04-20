import { isUuid } from "~/lib/typeguards";
import { type ApiEducation, type EducationIncludes } from "~/prisma/model";
import { type Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducation = <I extends EducationIncludes>(
  id: string | null,
  {
    includes,
    visibility,
    ...config
  }: SWRConfig<ApiEducation<I>> & {
    readonly includes: I;
    readonly visibility: Visibility;
  },
) =>
  useSWR<ApiEducation<I>>(isUuid(id) ? `/api/educations/${id}` : null, {
    ...config,
    query: {
      ...config.query,
      includes,
      visibility,
    },
  });
