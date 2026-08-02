import { type ApiProject, type ProjectIncludes } from '~/database/model';
import { isUuid } from '~/lib/typeguards';

import { type ProjectControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useProject = <I extends ProjectIncludes>(
  id: string,
  config: SWRConfig<ApiProject<I>, ProjectControls<I>>,
) => useSWR<ApiProject<I>, ProjectControls<I>>(isUuid(id) ? `/api/projects/${id}` : null, config);
