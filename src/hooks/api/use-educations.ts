import { encodeQueryParam } from "~/lib/urls";
import { type ApiEducation, type EducationIncludes } from "~/prisma/model";
import { type Visibility } from "~/api/query";

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
      visibility: encodeQueryParam(visibility),
      inclues: encodeQueryParam(includes),
    },
  });
