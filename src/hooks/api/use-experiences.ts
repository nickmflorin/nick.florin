import { type ApiExperience } from "~/prisma/model";
import { type Visibility } from "~/actions/visibility";

import { useSWR, type SWRConfig } from "./use-swr";

export const useExperiences = ({
  visibility,
  ...config
}: SWRConfig<ApiExperience<{ details: true }>[]> & { readonly visibility?: Visibility }) =>
  useSWR<ApiExperience<{ details: true }>[]>("/api/experiences", {
    ...config,
    query: { ...config.query, visibility },
  });
