import qs from "qs";

import { isRecordType } from "~/lib/typeguards";

import { countCharsInString } from "./util";

export interface ParsedQueryObj {
  [key: string]: ParsedQueryValue;
}

type ParsedQueryPrimitive = string | number | boolean | null;
type _ParsedQueryValue = ParsedQueryPrimitive | ParsedQueryObj | ParsedQueryValue[];
export type ParsedQueryValue = _ParsedQueryValue | _ParsedQueryValue[];

const isNumber = (val: string) => {
  const regex = /^\.?[0-9]+[0-9\.]*$/;
  return regex.test(val) && !isNaN(parseFloat(val)) && isFinite(parseFloat(val));
};

export const decodeQueryParamArray = (obj: string[]) => {
  const newArr: ParsedQueryValue[] = [];
  for (const val of obj) {
    if (typeof val === "string") {
      newArr.push(decodeQueryParamValue(val));
    } else if (Array.isArray(val)) {
      newArr.push(decodeQueryParamArray(val));
    } else {
      newArr.push(decodeQueryParamsObj(val));
    }
  }
  return newArr;
};

export const decodeQueryParamValue = (str: string): number | boolean | string | null => {
  if (isNumber(str)) {
    return parseFloat(str);
  } else if (str === "true" || str === "false") {
    return str === "true";
  } else if (str === "null") {
    return null;
  }
  return str;
};

export const decodeQueryParamsObj = (obj: Record<string, unknown>) => {
  const newObj: ParsedQueryObj = {};
  for (const k in obj) {
    const value = obj[k];
    if (typeof value === "string") {
      newObj[k] = decodeQueryParamValue(value);
    } else if (Array.isArray(value)) {
      newObj[k] = decodeQueryParamArray(value);
    } else if (isRecordType(value)) {
      newObj[k] = decodeQueryParamsObj(value);
    } else {
      throw new Error(`Encountered unexpected query value in nested object: '${String(value)}'!`);
    }
  }
  return newObj;
};

/**
 * An adaptive form of the {@link qs.parse} method that recursively attempts to intelligently parse
 * primitive values (null, number, boolean) in string form to their proper types.
 *
 * This method can handle the parsing of both query parameters as a set (provided as a string,
 * {@link URLSearchParams}, or {@link Record<string, string>}), as well as individual query
 * parameter scalars (see examples below).
 *
 * The {@link qs} package is used because it allows for the decoding and encoding of nested objects
 * and arrays in a set of query parameters.  The {@link qs} package is what is used behind the
 * scenes in an expressJS application to include the parsed query parameters in the route handlers
 * - which is not something that NextJS offers out of the box.
 *
 * While the {@link qs} package is great, when it encounters a primitive value in the  form of a
 * string, (such as "null" or "false"), it intentionally does not attempt to parse it into its
 * primitive form (i.e. null, or false, respectively) (see Reference 1).  Instead, the package
 * recommends using another package, "query-types" (see Reference 2), which acts as middleware
 * in an expressJS application and is responsible for parsing primitive string values as their
 * true type (i.e. "null" is parsed as null).
 *
 * Since the "query-types" package is rather light-weight, and we do not want to use it in the
 * context of middleware for an expressJS application, we referenced some of that package's logic
 * in the below method to parse primitive values in string form to their true type.
 *
 * References:
 * ----------
 * (1) https://github.com/ljharb/qs?tab=readme-ov-file#parsing-primitivescalar-values-numbers-booleans-null-etc
 * (2) https://github.com/xpepermint/query-types/tree/master
 *
 * @example
 * // Parsing as a Scalar - Returns false
 * decodeQueryParams("false");
 *
 * @example
 * // Parsing as a Set of Query Parameters - Returns Record-Type
 * decodeQueryParams("a=1&b=2&c=3");
 *
 * // or
 * decodeQueryParams({ a: "1", b: "2", c: "3"})
 */
export function decodeQueryParams(query: Record<string, string> | URLSearchParams): ParsedQueryObj;
export function decodeQueryParams(query: { url: string }): ParsedQueryObj;
export function decodeQueryParams(query: string[]): ParsedQueryValue[];
export function decodeQueryParams(query: string): ParsedQueryValue;
export function decodeQueryParams(
  query: string | string[] | Record<string, string> | URLSearchParams,
) {
  if (Array.isArray(query)) {
    return decodeQueryParamArray(query);
  } else if (typeof query === "string") {
    /* If the value is a string, we do not know whether or not it is a scalar or a set of query
       parameters.  Attempt to parse it as a set of query parameters first - if the result is a
       record type, then we know it is a set of query parameters and it can be parsed as an object.
       Otherwise, we know it is a scalar, and can be parsed as a single value. */
    const parsed = qs.parse(query, { allowEmptyArrays: true });
    if (isRecordType(parsed)) {
      return decodeQueryParamsObj(parsed);
    }
    return decodeQueryParamValue(query);
  } else if (query instanceof URLSearchParams) {
    return decodeQueryParams(query.toString());
  } else if (typeof (query as { url: string }).url === "string") {
    const { url } = query as { url: string };
    if (url.includes("?")) {
      if (countCharsInString(url, "?") > 1) {
        throw new Error(`Encountered invalid URL ${url}!`);
      }
      return decodeQueryParams(url.split("?")[1]);
    }
    return {};
  } else {
    const parsed = qs.parse(query, { allowEmptyArrays: true });
    if (isRecordType(parsed)) {
      return decodeQueryParamsObj(parsed);
    }
    throw new Error(`Encountered unexpected query value ${String(query)}!`);
  }
}
