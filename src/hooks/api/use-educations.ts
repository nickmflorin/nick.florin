import { type ApiEducation } from "~/prisma/model";
import { type Visibility } from "~/app/api/types";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducations = ({
  visibility,
  ...config
}: SWRConfig<ApiEducation<{ details: true }>[]> & { readonly visibility?: Visibility }) =>
  useSWR<ApiEducation<{ details: true }>[]>("/api/educations", {
    ...config,
    query: { ...config.query, visibility },
  });
