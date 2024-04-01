import {
  type FullApiDetail,
  type Education,
  type Experience,
  DetailEntityType,
} from "~/prisma/model";

import { useSWR, type SWRConfig } from "./use-swr";

type Response<T extends DetailEntityType> = {
  [DetailEntityType.EDUCATION]: {
    readonly details: FullApiDetail[];
    readonly education: Education;
  };
  [DetailEntityType.EXPERIENCE]: {
    readonly details: FullApiDetail[];
    readonly experience: Experience;
  };
}[T];

const PATHS: { [key in DetailEntityType]: (id: string) => `/api/${string}/${string}/details` } = {
  [DetailEntityType.EDUCATION]: id => `/api/educations/${id}/details`,
  [DetailEntityType.EXPERIENCE]: id => `/api/experiences/${id}/details`,
};

export const useDetails = <T extends DetailEntityType>(
  id: string | null,
  entityType: T,
  config?: SWRConfig<Response<T>>,
) => useSWR<Response<T>>(id ? PATHS[entityType](id) : null, config ?? {});
