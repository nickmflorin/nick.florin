import { type ApiExperience, type ExperienceIncludes } from '~/database/model';

import { type FlattenedExperiencesControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useExperiences = <I extends ExperienceIncludes>(
  config: SWRConfig<ApiExperience<I>[], FlattenedExperiencesControls<I>>,
) => useSWR<ApiExperience<I>[], FlattenedExperiencesControls<I>>('/api/experiences', config);
