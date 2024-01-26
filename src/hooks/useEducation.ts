import { type School, type Education } from "~/prisma/model";

import { useSWR, type SWRConfig } from "./useSWR";

export const useEducation = (config?: SWRConfig<(Education & { readonly school: School })[]>) =>
  useSWR<(Education & { readonly school: School })[]>("/api/education", config ?? {});
