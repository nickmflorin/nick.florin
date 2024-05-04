import { type ApiCourse, type CourseIncludes } from "~/prisma/model";
import { type GetCoursesParams } from "~/actions/fetches/courses";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCourses = <I extends CourseIncludes>(
  config: SWRConfig<ApiCourse<I>[], GetCoursesParams<I>>,
) => useSWR<ApiCourse<I>[], GetCoursesParams<I>>("/api/courses", config);
