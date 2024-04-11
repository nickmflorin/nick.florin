import { isUuid } from "~/lib/typeguards";
import { encodeQueryParam } from "~/lib/urls";
import { type ApiExperience, type ExperienceIncludes } from "~/prisma/model";
import { type Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useExperience = <I extends ExperienceIncludes>(
  id: string | null,
  {
    includes,
    visibility,
    ...config
  }: SWRConfig<ApiExperience<I>> & {
    readonly includes: I;
    readonly visibility: Visibility;
  },
) =>
  useSWR<ApiExperience<I>>(isUuid(id) ? `/api/experiences/${id}` : null, {
    ...config,
    query: {
      ...config.query,
      visibility: encodeQueryParam(visibility),
      includes: encodeQueryParam(includes),
    },
  });
