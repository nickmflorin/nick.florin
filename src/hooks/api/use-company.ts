import { isUuid } from "~/lib/typeguards";
import { encodeQueryParam } from "~/lib/urls";
import { type ApiCompany, type CompanyIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCompany = <I extends CompanyIncludes>(
  id: string | null,
  {
    includes,
    visibility,
    ...config
  }: SWRConfig<ApiCompany<I>> & { readonly includes: I; readonly visibility: Visibility },
) =>
  useSWR<ApiCompany<I>>(isUuid(id) ? `/api/companies/${id}` : null, {
    ...config,
    query: { ...config.query, includes: encodeQueryParam(includes), visibility },
  });
