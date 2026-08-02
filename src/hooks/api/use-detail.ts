import {
  type ApiDetail,
  type ApiNestedDetail,
  type DetailIncludes,
  type NestedDetailIncludes,
  type ToSkillIncludes,
} from '~/database/model';

import { type DetailControls, type NestedDetailControls } from '~/actions';

import { type SWRConfig, useSWR } from './use-swr';

const PrimaryPath = <I extends string>(id: I): `/api/details/${I}` => `/api/details/${id}`;

const NestedPath = <I extends string>(id: I): `/api/nested-details/${I}` =>
  `/api/nested-details/${id}`;

type NestedParams = { id: string; isNested: true };
type PrimaryParams = { id: string; isNested?: false };
type Params = NestedParams | PrimaryParams;

const paramsArePrimary = (params: Params): params is PrimaryParams => params.isNested !== true;

type M<P extends NestedParams | PrimaryParams, I extends DetailIncludes> = P extends NestedParams
  ? ApiNestedDetail<ToSkillIncludes<I>>
  : ApiDetail<I>;

type Includes<P extends NestedParams | PrimaryParams> = P extends NestedParams
  ? NestedDetailIncludes
  : DetailIncludes;

type Controls<
  P extends NestedParams | PrimaryParams,
  I extends Includes<P>,
> = P extends NestedParams
  ? NestedDetailControls<I & NestedDetailIncludes>
  : DetailControls<DetailIncludes & I>;

export function useDetail<P extends NestedParams | PrimaryParams, I extends Includes<P>>(
  params: null | P,
  config: SWRConfig<M<P, I>, Controls<P, I>>,
) {
  const path =
    params === null
      ? null
      : paramsArePrimary(params)
        ? PrimaryPath(params.id)
        : NestedPath(params.id);
  return useSWR<M<P, I>, Controls<P, I>>(path, config);
}
