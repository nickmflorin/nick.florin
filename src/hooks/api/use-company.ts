import { isUuid } from "~/lib/typeguards";
import { type Company } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCompany = (id: string | null, config?: SWRConfig<Company>) =>
  useSWR<Company>(isUuid(id) ? `/api/companies/${id}` : null, config ?? {});
