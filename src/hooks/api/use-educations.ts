import { type ApiEducation } from "~/prisma/model";
import { type Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useEducations = ({
  visibility,
  ...config
}: SWRConfig<ApiEducation<["details"]>[]> & { readonly visibility?: Visibility }) =>
  useSWR<ApiEducation<["details"]>[]>("/api/educations", {
    ...config,
    query: { ...config.query, visibility },
  });
