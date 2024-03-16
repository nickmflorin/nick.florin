import { isUuid } from "~/lib/typeguards";
import { type ApiEducation } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducation = (id: string | null, config?: SWRConfig<ApiEducation>) =>
  useSWR<ApiEducation>(isUuid(id) ? `/api/educations/${id}` : null, config ?? {});
