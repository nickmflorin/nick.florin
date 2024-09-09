import {
  type ApiDetail,
  DetailEntityType,
  type DetailIncludes,
  type BrandExperience,
  type BrandEducation,
} from "~/prisma/model";

import { type GetDetailsParams } from "~/actions/fetches/details";

import { useSWR, type SWRConfig } from "./use-swr";

type Response<I extends DetailIncludes, T extends DetailEntityType> = {
  [DetailEntityType.EDUCATION]: {
    readonly details: ApiDetail<I>[];
    readonly entity: BrandEducation;
  };
  [DetailEntityType.EXPERIENCE]: {
    readonly details: ApiDetail<I>[];
    readonly entity: BrandExperience;
  };
}[T];

const PATHS: { [key in DetailEntityType]: (id: string) => `/api/${string}/${string}/details` } = {
  [DetailEntityType.EDUCATION]: id => `/api/educations/${id}/details`,
  [DetailEntityType.EXPERIENCE]: id => `/api/experiences/${id}/details`,
};

export const useDetails = <I extends DetailIncludes, T extends DetailEntityType>(
  id: string | null,
  entityType: T,
  config: SWRConfig<Response<I, T>, GetDetailsParams<I>>,
) => useSWR<Response<I, T>, GetDetailsParams<I>>(id ? PATHS[entityType](id) : null, config);
