import { type ApiSkill, type SkillIncludes } from '~/database/model';
import { isUuid } from '~/lib/typeguards';

import { type SkillControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useSkill = <I extends SkillIncludes>(
  id: string,
  config: SWRConfig<ApiSkill<I>, SkillControls<I>>,
) => useSWR<ApiSkill<I>, SkillControls<I>>(isUuid(id) ? `/api/skills/${id}` : null, config);
