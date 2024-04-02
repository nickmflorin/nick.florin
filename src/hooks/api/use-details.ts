import {
  type ApiDetail,
  type Education,
  type Experience,
  DetailEntityType,
  type DetailIncludes,
} from "~/prisma/model";
import { encodeInclusionQuery } from "~/api/inclusion";

import { useSWR, type SWRConfig } from "./use-swr";

type Response<I extends DetailIncludes, T extends DetailEntityType> = {
  [DetailEntityType.EDUCATION]: {
    readonly details: ApiDetail<I>[];
    readonly education: Education;
  };
  [DetailEntityType.EXPERIENCE]: {
    readonly details: ApiDetail<I>[];
    readonly experience: Experience;
  };
}[T];

const PATHS: { [key in DetailEntityType]: (id: string) => `/api/${string}/${string}/details` } = {
  [DetailEntityType.EDUCATION]: id => `/api/educations/${id}/details`,
  [DetailEntityType.EXPERIENCE]: id => `/api/experiences/${id}/details`,
};

export const useDetails = <I extends DetailIncludes, T extends DetailEntityType>(
  id: string | null,
  entityType: T,
  includes: I,
  config?: SWRConfig<Response<I, T>>,
) =>
  useSWR<Response<I, T>>(id ? PATHS[entityType](id) : null, {
    ...config,
    query: { ...config?.query, includes: encodeInclusionQuery(includes) },
  });
