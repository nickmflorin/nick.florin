import { isUuid } from "~/lib/typeguards";
import { type ApiExperience } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useExperience = (id: string | null, config?: SWRConfig<ApiExperience>) =>
  useSWR<ApiExperience>(isUuid(id) ? `/api/experiences/${id}` : null, config ?? {});
