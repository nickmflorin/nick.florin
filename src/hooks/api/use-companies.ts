import { type Company } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useCompanies = (config?: SWRConfig<Company[]>) =>
  useSWR<Company[]>("/api/companies", config ?? {});
