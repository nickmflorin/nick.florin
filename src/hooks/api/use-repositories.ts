import { type ApiRepository, type RepositoryIncludes } from '~/database/model';

import { type FlattenedRepositoriesControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useRepositories = <I extends RepositoryIncludes>(
  config: SWRConfig<ApiRepository<I>[], FlattenedRepositoriesControls<I>>,
) => useSWR<ApiRepository<I>[], FlattenedRepositoriesControls<I>>('/api/repositories', config);
