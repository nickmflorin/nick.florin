import { type ApiCompany, type CompanyIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type GetCompanyParams } from "~/actions/fetches/companies";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCompany = <I extends CompanyIncludes>(
  id: string | null,
  config: SWRConfig<ApiCompany<I>, GetCompanyParams<I>>,
) => useSWR<ApiCompany<I>, GetCompanyParams<I>>(isUuid(id) ? `/api/companies/${id}` : null, config);
