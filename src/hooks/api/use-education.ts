import { type ApiEducation, type EducationIncludes } from '~/database/model';
import { isUuid } from '~/lib/typeguards';

import { type EducationControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useEducation = <I extends EducationIncludes>(
  id: string,
  config: SWRConfig<ApiEducation<I>, EducationControls<I>>,
) =>
  useSWR<ApiEducation<I>, EducationControls<I>>(
    isUuid(id) ? `/api/educations/${id}` : null,
    config,
  );
