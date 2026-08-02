import { type ApiCompany, type CompanyIncludes } from '~/database/model';

import { type FlattenedCompaniesControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

export const useCompanies = <I extends CompanyIncludes>(
  config: SWRConfig<ApiCompany<I>[], FlattenedCompaniesControls<I>>,
) => useSWR<ApiCompany<I>[], FlattenedCompaniesControls<I>>('/api/companies', config);
