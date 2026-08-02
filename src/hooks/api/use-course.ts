import { type ApiCourse, type CourseIncludes } from '~/database/model';
import { isUuid } from '~/lib/typeguards';

import { type CourseControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useCourse = <I extends CourseIncludes>(
  id: string,
  config: SWRConfig<ApiCourse<I>, CourseControls<I>>,
) => useSWR<ApiCourse<I>, CourseControls<I>>(isUuid(id) ? `/api/courses/${id}` : null, config);
