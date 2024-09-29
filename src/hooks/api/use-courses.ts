import type { ApiCourse, CourseIncludes } from "~/database/model";

import { type FlattenedCoursesControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCourses = <I extends CourseIncludes>(
  config: SWRConfig<ApiCourse<I>[], FlattenedCoursesControls<I>>,
) => useSWR<ApiCourse<I>[], FlattenedCoursesControls<I>>("/api/courses", config);
