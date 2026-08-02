import { type ApiExperience, type ExperienceIncludes } from '~/database/model';
import { isUuid } from '~/lib/typeguards';

import { type ExperienceControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useExperience = <I extends ExperienceIncludes>(
  id: string,
  config: SWRConfig<ApiExperience<I>, ExperienceControls<I>>,
) =>
  useSWR<ApiExperience<I>, ExperienceControls<I>>(
    isUuid(id) ? `/api/experiences/${id}` : null,
    config,
  );
