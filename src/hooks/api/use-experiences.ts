import { type ApiExperience, type ExperienceIncludes } from "~/prisma/model";
import { type Visibility } from "~/api/route";

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
      includes,
      visibility,
    },
  });
