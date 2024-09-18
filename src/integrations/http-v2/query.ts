import qs, { type ParsedUrlQuery } from "querystring";
import urlModule from "url";

export type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | QueryParamObj
  | QueryParamValue[];

export type QueryParamObj = {
  [k: string]: QueryParamValue;
};

export const parseQueryParams = (value: string) => qs.parse(value);

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const stringifyQueryParams = (query: any) => qs.stringify(query);

/**
 * Parses the query parameters from the provided URL and returns the query parameters as an object.
 *
 * @param {string} url The URL that the query parameters should be parsed from.
 *
 * @returns {Record<string, string>}
 * 	 An object that represents the parameter names and values that are in the URL.
 */
export const getQueryParams = (url: string): ParsedUrlQuery => {
  const queryString = urlModule.parse(url).query;
  if (queryString) {
    return parseQueryParams(queryString);
  }
  return {};
};

export function addQueryParamsToUrl(url: string, query?: QueryParamObj): string;
export function addQueryParamsToUrl(url: string, query: string): string;
export function addQueryParamsToUrl(url: string, query: URLSearchParams): string;

/**
 * Adds the provided query parameters to the provided URL or path, overwriting existing query
 * parameters that may already exist on the provided URL or path.
 *
 * @param {string} url The URL or path that the query parameters should be added to.
 *
 * @param {QueryParamObj} query The query parameters that should be added to the URL or path.
 *
 * @param {AddQueryParamsToUrlOptions} options
 *   The options that dictate how the query parameters should be pruned before being included in
 *   the resulting URL.
 *
 * @returns {string} The URL or path with the query parameters added.
 */
export function addQueryParamsToUrl(
  url: string,
  query?: QueryParamObj | string | URLSearchParams,
): string {
  if (typeof query === "string" || query instanceof URLSearchParams) {
    const q = typeof query === "string" ? query : query.toString();
    if (q.startsWith("?")) {
      return url.split("?")[0] + q;
    } else if (q.length !== 0) {
      return url.split("?")[0] + "?" + q;
    }
    return url;
  } else if (!query) {
    return url;
  }
  return addQueryParamsToUrl(url, stringifyQueryParams(query));
}
