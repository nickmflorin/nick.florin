import {
  type ApiDetail,
  type BrandEducation,
  type BrandExperience,
  DetailEntityType,
  type DetailIncludes,
} from '~/database/model';
import { isUuid } from '~/lib/typeguards';

import { type FlattenedDetailsControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

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

const PATHS: Record<DetailEntityType, (id: string) => `/api/${string}/${string}/details`> = {
  [DetailEntityType.EDUCATION]: id => `/api/educations/${id}/details`,
  [DetailEntityType.EXPERIENCE]: id => `/api/experiences/${id}/details`,
};

export const useDetails = <I extends DetailIncludes, T extends DetailEntityType>(
  id: null | string,
  entityType: T,
  config: SWRConfig<Response<I, T>, Omit<FlattenedDetailsControls<I>, 'entityIds' | 'entityTypes'>>,
) =>
  useSWR<Response<I, T>, Omit<FlattenedDetailsControls<I>, 'entityIds' | 'entityTypes'>>(
    id && isUuid(id) ? PATHS[entityType](id) : null,
    config,
  );
