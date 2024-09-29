import type { ApiCompany, CompanyIncludes } from "~/database/model";

import { type FlattenedCompaniesControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCompanies = <I extends CompanyIncludes>(
  config: SWRConfig<ApiCompany<I>[], Partial<FlattenedCompaniesControls<I>>>,
) => useSWR<ApiCompany<I>[], Partial<FlattenedCompaniesControls<I>>>("/api/companies", config);
