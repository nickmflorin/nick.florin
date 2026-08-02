import { type ApiCompany, type CompanyIncludes } from '~/database/model';
import { isUuid } from '~/lib/typeguards';

import { type CompanyControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useCompany = <I extends CompanyIncludes>(
  id: string,
  config: SWRConfig<ApiCompany<I>, CompanyControls<I>>,
) => useSWR<ApiCompany<I>, CompanyControls<I>>(isUuid(id) ? `/api/companies/${id}` : null, config);
