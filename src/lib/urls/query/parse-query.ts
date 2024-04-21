import qs from "qs";
import { z } from "zod";

import { transformQueryParams } from "./transform-query-params";

export interface ParsedQueryObj {
  [key: string]: ParsedQueryValue;
}

type ParsedQueryPrimitive = string | number | boolean | null | undefined;
type _ParsedQueryValue = ParsedQueryPrimitive | ParsedQueryObj | ParsedQueryValue[];
export type ParsedQueryValue = _ParsedQueryValue | _ParsedQueryValue[];

const isRecordType = (value: unknown): value is Record<string, unknown> =>
  z.record(z.any()).safeParse(value).success;

const isNumber = (val: string) => {
  const regex = /^\.?[0-9]+[0-9\.]*$/;
  return regex.test(val) && !isNaN(parseFloat(val)) && isFinite(parseFloat(val));
};

export const parseQueryNumber = (val: string) => (isNumber(val) ? parseFloat(val) : undefined);

export const parseQueryInteger = (val: string) => {
  const num = parseQueryNumber(val);
  return num ? Number(num.toFixed(0)) : undefined;
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
 * parseQuery("false");
 *
 * @example
 * // Parsing as a Set of Query Parameters - Returns Record-Type
 * parseQuery("a=1&b=2&c=3");
 *
 * // or
 * parseQuery({ a: "1", b: "2", c: "3"})
 */
export function parseQuery(query: Record<string, string> | URLSearchParams): ParsedQueryObj;
export function parseQuery(query: string[]): ParsedQueryValue[];
export function parseQuery(query: string): ParsedQueryValue;
export function parseQuery(query: string | string[] | Record<string, string> | URLSearchParams) {
  const parseAsArray = (obj: string[]) => {
    const newArr: ParsedQueryValue[] = [];
    for (const val of obj) {
      if (typeof val === "string") {
        newArr.push(parseAsValue(val));
      } else if (Array.isArray(val)) {
        newArr.push(parseAsArray(val));
      } else {
        newArr.push(parseAsObj(val));
      }
    }
    return newArr;
  };

  const parseAsValue = (str: string): number | boolean | string | null => {
    // First, attempt to parse the value as a number.
    if (isNumber(str)) {
      return parseFloat(str);
    } else if (str === "true" || str === "false") {
      return str === "true";
    } else if (str === "null") {
      return null;
    }
    return str;
  };

  const parseAsObj = (obj: Record<string, unknown>) => {
    const newObj: ParsedQueryObj = {};
    for (const k in obj) {
      const value = obj[k];
      if (typeof value === "string") {
        newObj[k] = parseAsValue(value);
      } else if (Array.isArray(value)) {
        newObj[k] = parseAsArray(value);
      } else if (isRecordType(value)) {
        newObj[k] = parseAsObj(value);
      } else {
        throw new Error(`Encountered unexpected query value in nested object: '${String(value)}'!`);
      }
    }
    return newObj;
  };

  if (Array.isArray(query)) {
    return parseAsArray(query);
  } else if (typeof query === "string") {
    /* If the value is a string, we do not know whether or not it is a scalar or a set of query
       parameters.  Attempt to parse it as a set of query parameters first - if the result is a
       record type, then we know it is a set of query parameters and it can be parsed as an object.
       Otherwise, we know it is a scalar, and can be parsed as a single value. */
    const parsed = qs.parse(query, { allowEmptyArrays: true });
    if (isRecordType(parsed)) {
      return parseAsObj(parsed);
    }
    return parseAsValue(query);
  } else if (query instanceof URLSearchParams) {
    const transformed = transformQueryParams(query, { form: "record" });
    return parseAsObj(transformed);
  } else {
    const parsed = qs.parse(query, { allowEmptyArrays: true });
    if (isRecordType(parsed)) {
      return parseAsObj(parsed);
    }
    throw new Error(`Encountered unexpected query value ${String(query)}!`);
  }
}
