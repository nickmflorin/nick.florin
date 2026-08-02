import { type BrandResume } from '~/database/model';

import { type FlattenedResumesControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useResumes = (config: SWRConfig<BrandResume[], FlattenedResumesControls>) =>
  useSWR<BrandResume[], FlattenedResumesControls>('/api/resumes', config);
