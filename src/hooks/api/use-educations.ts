import { type ApiEducation, type EducationIncludes } from "~/prisma/model";
import { type Visibility } from "~/api/route";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducations = <I extends EducationIncludes>({
  visibility,
  includes,
  ...config
}: SWRConfig<ApiEducation<I>[]> & { readonly visibility: Visibility; readonly includes: I }) =>
  useSWR<ApiEducation<I>[]>("/api/educations", {
    ...config,
    query: {
      ...config.query,
      includes,
      visibility,
    },
  });
