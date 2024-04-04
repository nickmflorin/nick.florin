import { encodeQueryParam } from "~/lib/urls";
import { type SchoolIncludes, type School } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSchools = <I extends SchoolIncludes>({
  includes,
  ...config
}: SWRConfig<School[]> & { readonly includes: I }) =>
  useSWR<School[]>("/api/schools", {
    ...config,
    query: { ...config.query, includes: encodeQueryParam(includes) },
  });
