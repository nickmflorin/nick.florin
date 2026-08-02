import { type ApiSchool, type SchoolIncludes } from '~/database/model';

import { type FlattenedSchoolsControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useSchools = <I extends SchoolIncludes>(
  config: SWRConfig<ApiSchool<I>[], FlattenedSchoolsControls<I>>,
) => useSWR<ApiSchool<I>[], FlattenedSchoolsControls<I>>('/api/schools', config);
