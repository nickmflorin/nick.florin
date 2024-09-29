import type { ApiCompany, CompanyIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type CompanyControls } from "~/actions";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCompany = <I extends CompanyIncludes>(
  id: string,
  config: SWRConfig<ApiCompany<I>, CompanyControls<I>>,
) =>
  useSWR<ApiCompany<I>, CompanyControls<I>>(
    // TODO: Revisit the conditional here.
    isUuid(id) ? `/api/companies/${id}` : null,
    config,
  );
