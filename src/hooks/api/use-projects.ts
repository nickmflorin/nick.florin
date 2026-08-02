import { type ApiProject, type ProjectIncludes } from '~/database/model';

import { type FlattenedProjectsControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useProjects = <I extends ProjectIncludes>(
  config: SWRConfig<ApiProject<I>[], FlattenedProjectsControls<I>>,
) => useSWR<ApiProject<I>[], FlattenedProjectsControls<I>>('/api/projects', config);
