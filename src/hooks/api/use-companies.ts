import { type CompanyIncludes, type Company } from "~/prisma/model";
import { type GetCompaniesParams } from "~/actions/fetches/companies";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCompanies = <I extends CompanyIncludes>(
  config: SWRConfig<Company[], GetCompaniesParams<I>>,
) => useSWR<Company[], GetCompaniesParams<I>>("/api/companies", config);
