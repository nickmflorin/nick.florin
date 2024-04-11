import { encodeQueryParam } from "~/lib/urls";
import { type ApiExperience, type ExperienceIncludes } from "~/prisma/model";
import { type Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useExperiences = <I extends ExperienceIncludes>({
  visibility,
  includes,
  ...config
}: SWRConfig<ApiExperience<I>[]> & { readonly visibility: Visibility; readonly includes: I }) =>
  useSWR<ApiExperience<I>[]>("/api/experiences", {
    ...config,
    query: {
      ...config.query,
      visibility: encodeQueryParam(visibility),
      inclues: encodeQueryParam(includes),
    },
  });
