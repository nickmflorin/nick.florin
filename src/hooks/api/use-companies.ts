import { encodeQueryParam } from "~/lib/urls";
import { type CompanyIncludes, type Company } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCompanies = <I extends CompanyIncludes>({
  includes,
  ...config
}: SWRConfig<Company[]> & { readonly includes: I }) =>
  useSWR<Company[]>("/api/companies", {
    ...config,
    query: { ...config.query, includes: encodeQueryParam(includes) },
  });
