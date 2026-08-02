import { type ApiCourse, type CourseIncludes } from '~/database/model';

import { type FlattenedCoursesControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useCourses = <I extends CourseIncludes>(
  config: SWRConfig<ApiCourse<I>[], FlattenedCoursesControls<I>>,
) => useSWR<ApiCourse<I>[], FlattenedCoursesControls<I>>('/api/courses', config);
