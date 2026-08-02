import { type ApiSchool, type SchoolIncludes } from '~/database/model';
import { isUuid } from '~/lib/typeguards';

import { type SchoolControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useSchool = <I extends SchoolIncludes>(
  id: string,
  config: SWRConfig<ApiSchool<I>, SchoolControls<I>>,
) => useSWR<ApiSchool<I>, SchoolControls<I>>(isUuid(id) ? `/api/schools/${id}` : null, config);
