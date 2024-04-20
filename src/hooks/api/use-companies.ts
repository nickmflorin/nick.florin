import { type CompanyIncludes, type Company } from "~/prisma/model";
import type { Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCompanies = <I extends CompanyIncludes>({
  includes,
  visibility,
  ...config
}: SWRConfig<Company[]> & { readonly includes: I; readonly visibility: Visibility }) =>
  useSWR<Company[]>("/api/companies", {
    ...config,
    query: {
      ...config.query,
      includes,
      visibility,
    },
  });
