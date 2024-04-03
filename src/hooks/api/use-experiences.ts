import { type ApiExperience } from "~/prisma/model";
import { type Visibility } from "~/api/query";

import { useSWR, type SWRConfig } from "./use-swr";

export const useExperiences = ({
  visibility,
  ...config
}: SWRConfig<ApiExperience<["details"]>[]> & { readonly visibility?: Visibility }) =>
  useSWR<ApiExperience<["details"]>[]>("/api/experiences", {
    ...config,
    query: { ...config.query, visibility },
  });
