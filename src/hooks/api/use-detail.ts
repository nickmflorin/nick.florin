import {
  type ApiDetail,
  type DetailIncludes,
  type NestedApiDetail,
  type ToSkillIncludes,
} from "~/prisma/model";

import { type GetDetailParams } from "~/actions/fetches/details";

import { useSWR, type SWRConfig, type SWRResponse } from "./use-swr";

const PrimaryPath = <I extends string>(id: I): `/api/details/${I}` => `/api/details/${id}`;

const NestedPath = <I extends string>(id: I): `/api/nested-details/${I}` =>
  `/api/nested-details/${id}`;

type NestedParams = { id: string; isNested: true };
type PrimaryParams = { id: string; isNested?: false };
type Params = NestedParams | PrimaryParams;

const paramsArePrimary = (params: Params): params is PrimaryParams =>
  (params as NestedParams).isNested !== true;

type M<P extends PrimaryParams | NestedParams, I extends DetailIncludes> = P extends NestedParams
  ? NestedApiDetail<ToSkillIncludes<I>>
  : ApiDetail<I>;

export function useDetail<P extends NestedParams | PrimaryParams, I extends DetailIncludes>(
  params: P | null,
  config: SWRConfig<M<P, I>, GetDetailParams<I>>,
): SWRResponse<M<P, I>> {
  const path =
    params !== null
      ? paramsArePrimary(params)
        ? PrimaryPath(params.id)
        : NestedPath(params.id)
      : null;

  const result = useSWR<M<P, I>, GetDetailParams<I>>(path, config);
  return result as SWRResponse<M<P, I>>;
}
