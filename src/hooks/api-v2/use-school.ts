import type { ApiSchool, SchoolIncludes } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { type SchoolControls } from "~/actions-v2";

import { useSWR, type SWRConfig } from "./use-swr";

export const useSchool = <I extends SchoolIncludes>(
  id: string,
  config: SWRConfig<ApiSchool<I>, SchoolControls<I>>,
) =>
  useSWR<ApiSchool<I>, SchoolControls<I>>(
    // TODO: Revisit the conditional here.
    isUuid(id) ? `/api/schools/${id}` : null,
    config,
  );
