import type { ApiCourse, CourseIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type CourseControls } from "~/actions-v2";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCourse = <I extends CourseIncludes>(
  id: string,
  config: SWRConfig<ApiCourse<I>, CourseControls<I>>,
) =>
  useSWR<ApiCourse<I>, CourseControls<I>>(
    // TODO: Revisit the conditional here.
    isUuid(id) ? `/api/courses/${id}` : null,
    config,
  );
