import { isUuid } from "~/lib/typeguards";
import { type School } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSchool = (id: string | null, config?: SWRConfig<School>) =>
  useSWR<School>(isUuid(id) ? `/api/schools/${id}` : null, config ?? {});
