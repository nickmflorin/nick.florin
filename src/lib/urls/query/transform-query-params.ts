import { z } from "zod";

import {
  type QueryParamOptions,
  type QueryParams,
  type InferQueryParamsValue,
  type OptionsForm,
  getOptionsForm,
  type InferQueryParamsForm,
  type EncodedQueryParamValue,
  type QueryParamValue,
  type QueryParamsForm,
} from "./types";
import {
  getQueryParamsReducer,
  getInitialQueryParamsState,
  searchParamsIterator,
  getQueryParamForm,
} from "./util";
/**
 * Transforms the query parameters from the provided path, query string, URL,
 * {@link URLSearchParams} object, map of query parameters {@link Map}, or record-type,
 * {@link Record<string, string>}, into a set of query parameters of the form dictated by the
 * provided options.
 *
 * @param {P} params
 *   The path, query string, URL, {@link URLSearchParams} object, map of query parameters
 *   {@link Map}, or query parameters record-type, {@link Record<string, string>}, that contains
 *   the parameters that are being parsed.
 *
 * @param {ParseQueryParamOptions} options
 *   Options that dictate the manner in which the query parameters are transformed.
 *
 *   @property {QueryParamsForm} form
 *     The form in which the query parameters should be returned.  This can be one of the following:
 *     1. "map": Will return as a {@link Map} instance.
 *     2. "object": Will return as a {@link URLSearchParams} instance.
 *     3. "record": Will return as a record-type, {@link Record<string, string>}.
 *     4. "pairs": Will return as an array of key-value pairs, {@link QueryParamPairs}.
 *     5. "string": Will return as a query string.
 */
export const transformQueryParams = <P extends QueryParams, O extends QueryParamOptions>(
  params: P,
  options: O,
): QueryParams<OptionsForm<O>, InferQueryParamsValue<P>> => {
  const reducer = getQueryParamsReducer<OptionsForm<O>>(getOptionsForm(options));
  let state = getInitialQueryParamsState<O>(options) as QueryParams<
    OptionsForm<O>,
    InferQueryParamsValue<P>
  >;
  for (const [k, v] of searchParamsIterator(params)) {
    state = reducer<typeof state, InferQueryParamsValue<P>>(state, k, v) as QueryParams<
      OptionsForm<O>,
      InferQueryParamsValue<P>
    >;
  }
  return state;
};

export const decodeQueryParams = (
  params: QueryParams<QueryParamsForm, EncodedQueryParamValue>,
): QueryParams<"record", QueryParamValue> => {
  const decoded: QueryParams<"record", QueryParamValue> = {};
  for (const [k, v] of searchParamsIterator(params)) {
    const arrayRegex = /^\[(.)*,?\]$/;
    const numRegex = /^([0-9]|\.)*$/;
    if (
      arrayRegex.test(v.trim()) ||
      numRegex.test(v.trim()) ||
      ["null", "true", "false"].includes(v.trim())
    ) {
      decoded[k] = JSON.parse(v.trim());
    } else {
      decoded[k] = v;
    }
  }
  return decoded;
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
    if (typeof v === "string") {
      state = reducer<typeof state, EncodedQueryParamValue>(state, k, v) as QueryParams<
        InferQueryParamsForm<Q>,
        EncodedQueryParamValue
      >;
    } else if (Array.isArray(v)) {
      state = reducer<typeof state, EncodedQueryParamValue>(
        state,
        k,
        `[${v.map(vi => `"${vi}"`).join(",")}]`,
      ) as QueryParams<InferQueryParamsForm<Q>, EncodedQueryParamValue>;
    } else if (v !== undefined) {
      state = reducer<typeof state, EncodedQueryParamValue>(state, k, String(v)) as QueryParams<
        InferQueryParamsForm<Q>,
        EncodedQueryParamValue
      >;
    }
  }
  return state;
};
