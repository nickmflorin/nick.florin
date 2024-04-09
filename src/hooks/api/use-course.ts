import { isUuid } from "~/lib/typeguards";
import { encodeQueryParam } from "~/lib/urls";
import { type ApiCourse, type CourseIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCourse = <I extends CourseIncludes>(
  id: string | null,
  {
    includes,
    visibility,
    ...config
  }: SWRConfig<ApiCourse<I>> & { readonly includes: I; readonly visibility: Visibility },
) =>
  useSWR<ApiCourse<I>>(isUuid(id) ? `/api/courses/${id}` : null, {
    ...config,
    query: { ...config.query, includes: encodeQueryParam(includes), visibility },
  });
