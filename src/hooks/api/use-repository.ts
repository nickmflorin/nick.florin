import { type ApiRepository, type RepositoryIncludes } from '~/database/model';
import { isUuid } from '~/lib/typeguards';

import { type RepositoryControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useRepository = <I extends RepositoryIncludes>(
  id: string,
  config: SWRConfig<ApiRepository<I>, RepositoryControls<I>>,
) =>
  useSWR<ApiRepository<I>, RepositoryControls<I>>(
    isUuid(id) ? `/api/repositories/${id}` : null,
    config,
  );
