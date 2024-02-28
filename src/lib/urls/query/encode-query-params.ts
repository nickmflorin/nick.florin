import {
  type QueryParams,
  type InferQueryParamsForm,
  type EncodedQueryParamValue,
  type QueryParamValue,
} from "./types";
import {
  getQueryParamsReducer,
  getInitialQueryParamsState,
  searchParamsIterator,
  getQueryParamForm,
} from "./util";

export const encodeQueryParam = (
  v: Exclude<QueryParamValue, undefined>,
): EncodedQueryParamValue => {
  if (typeof v === "string") {
    return v;
  } else if (Array.isArray(v)) {
    return `[${v.map(vi => `"${vi}"`).join(",")}]`;
  } else if (v !== undefined) {
    return String(v);
  }
  // Never
  return v;
};

export const encodeQueryParams = <Q extends QueryParams>(
  params: Q,
): QueryParams<InferQueryParamsForm<Q>, EncodedQueryParamValue> => {
  const form = getQueryParamForm(params);

  const reducer = getQueryParamsReducer<InferQueryParamsForm<Q>>(form);

  let state = getInitialQueryParamsState({ form }) as QueryParams<
    InferQueryParamsForm<Q>,
    EncodedQueryParamValue
  >;
  for (const [k, v] of searchParamsIterator(params)) {
    if (v !== undefined) {
      state = reducer<typeof state, EncodedQueryParamValue>(
        state,
        k,
        encodeQueryParam(v),
      ) as QueryParams<InferQueryParamsForm<Q>, EncodedQueryParamValue>;
    }
  }
  return state;
};
