import { type NextRequest } from "next/server";

import clamp from "lodash.clamp";
import qs from "qs";
import { z } from "zod";

import { transformQueryParams, decodeQueryParam } from "~/lib/urls";

export type Visibility = "public" | "admin";

type PaginationParams = {
  readonly page?: number;
  readonly pageSize?: number;
  readonly getCount: () => Promise<number>;
};

export type Pagination = {
  readonly page: number;
  readonly count: number;
  readonly numPages: number;
  readonly pageSize: number;
};

export const parsePagination = async ({
  page,
  pageSize = 10,
  getCount,
}: PaginationParams): Promise<Pagination | null> => {
  const pg = page ? Math.max(page, 1) : undefined;
  if (pg) {
    const count = await getCount();
    const numPages = Math.max(Math.ceil(count / pageSize), 1);
    return { page: clamp(pg, 1, numPages), numPages, count, pageSize };
  }
  return null;
};

/**
 * @deprecated
 * Deprecated in favor of 'processQuery'.
 * @see processQuery
 */
export const parseBoolean = (
  request: NextRequest,
  key: string,
  opts?: { defaultValue?: boolean },
): boolean => {
  const params = request.nextUrl.searchParams;
  const v = params.get(key);
  const value = v ? decodeQueryParam(v, {}) : undefined;
  return typeof value === "boolean" ? value : opts?.defaultValue ?? false;
};

/**
 * @deprecated
 * Deprecated in favor of 'processQuery'.
 * @see processQuery
 */
const parseInteger = (value: unknown) => {
  const parsed = z.coerce.number().int().safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  return undefined;
};

interface RawQueryObj {
  [key: string]: RawQueryValue;
}

type RawQueryPrimitive = string;
type _RawQueryValue = RawQueryPrimitive | RawQueryObj | RawQueryValue[];
type RawQueryValue = _RawQueryValue | _RawQueryValue[];

export interface ProcessedQueryObj {
  [key: string]: ProcessedQueryValue;
}

type ProcessedQueryPrimitive = string | number | boolean | null | undefined;
type _ProcessedQueryValue = ProcessedQueryPrimitive | ProcessedQueryObj | ProcessedQueryValue[];
export type ProcessedQueryValue = _ProcessedQueryValue | _ProcessedQueryValue[];

const isRawQueryObj = (value: unknown): value is RawQueryObj =>
  typeof value === "object" && !Array.isArray(value) && value !== null;

export type ProcessedQuery = {
  readonly includes: string[];
  readonly visibility: Visibility;
  readonly limit?: number;
  [key: string]: ProcessedQueryValue;
};

/* // https://github.com/xpepermint/query-types/tree/master
    Not parsing scalars and primitives: https://github.com/ljharb/qs?tab=readme-ov-file#parsing-primitivescalar-values-numbers-booleans-null-etc */

function parseQuery(query: Record<string, unknown> | URLSearchParams): ProcessedQueryObj;
function parseQuery(query: unknown[]): ProcessedQueryValue[];
function parseQuery(query: unknown): ProcessedQueryValue;
function parseQuery(query: unknown) {
  const transformed: string | unknown =
    query instanceof URLSearchParams ? transformQueryParams(query, { form: "record" }) : query;

  const parsed = qs.parse(transformed, { allowEmptyArrays: true });

  if (typeof value === "string") {
    const parsedNumber = z.coerce.number().safeParse(value);
    if (parsedNumber.success) {
      return parsedNumber.data;
    } else if (value === "true" || value === "false") {
      return value === "true";
    } else if (value === "null") {
      return null;
    }
    return value;
  } else if (Array.isArray(value)) {
    const newArr: ProcessedQueryValue[] = [];
    for (const val of value) {
      newArr.push(parseQuery(val));
    }
    return newArr;
  } else if (isRawQueryObj(value)) {
    const newObj: ProcessedQueryObj = {};
    for (const k in value) {
      newObj[k] = parseQuery(value[k]);
    }
    return newObj;
  }
  throw new TypeError(`Encountered invalid value, '${String(value)}' as a query parameter!`);
}

export interface ParsedQuery {
  readonly [key: string]: ProcessedQueryValue;
}

export const parseQuery = (query: string | URLSearchParams | Record<string, string>) => {
  const transformed: Record<string, string> | string =
    query instanceof URLSearchParams ? transformQueryParams(query, { form: "record" }) : query;

  const parsed = qs.parse(transformed, { allowEmptyArrays: true });

  const { visibility: _visibility, includes, limit, ...rest } = parsed;
  const visibility: Visibility =
    typeof _visibility === "string" && _visibility.toLowerCase() === "admin" ? "admin" : "public";

  return {
    ...processQuery(rest),
    limit: parseInteger(limit),
    visibility,
    includes:
      Array.isArray(includes) && includes.every(i => typeof i === "string")
        ? (includes as string[])
        : [],
  };
};

export interface ApiParsedQuery {
  readonly [key: string]: ProcessedQueryValue;
  readonly limit?: number;
  readonly includes: string[];
  readonly visibility: Visibility;
}

export const parseApiQuery = (query: string | URLSearchParams | Record<string, string>) => {
  const transformed: Record<string, string> | string =
    query instanceof URLSearchParams ? transformQueryParams(query, { form: "record" }) : query;

  const parsed = qs.parse(transformed, { allowEmptyArrays: true });

  const { visibility: _visibility, includes, limit, ...rest } = parsed;
  const visibility: Visibility =
    typeof _visibility === "string" && _visibility.toLowerCase() === "admin" ? "admin" : "public";

  return {
    ...processQuery(rest),
    limit: parseInteger(limit),
    visibility,
    includes:
      Array.isArray(includes) && includes.every(i => typeof i === "string")
        ? (includes as string[])
        : [],
  };
};
