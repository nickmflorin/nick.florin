import { type ApiCourse, type CourseIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type GetCourseParams } from "~/actions/fetches/courses";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCourse = <I extends CourseIncludes>(
  id: string | null,
  config: SWRConfig<ApiCourse<I>, GetCourseParams<I>>,
) => useSWR<ApiCourse<I>, GetCourseParams<I>>(isUuid(id) ? `/api/courses/${id}` : null, config);
