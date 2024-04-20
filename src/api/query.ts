import clamp from "lodash.clamp";
import { z } from "zod";

import { transformQueryParams, parseQuery, type ParsedQueryValue } from "~/lib/urls";

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
 * Deprecated in favor of 'parseQuery'.
 * @see processQuery
 */
const parseInteger = (value: unknown) => {
  const parsed = z.coerce.number().int().safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  return undefined;
};

export interface ApiParsedQuery {
  readonly [key: string]: ParsedQueryValue;
  readonly limit?: number;
  readonly includes: string[];
  readonly visibility: Visibility;
}

export const parseApiQuery = (query: URLSearchParams | Record<string, string>) => {
  const transformed: Record<string, string> =
    query instanceof URLSearchParams ? transformQueryParams(query, { form: "record" }) : query;

  const { visibility: _visibility, includes, limit, ...rest } = parseQuery(transformed);

  const visibility: Visibility =
    typeof _visibility === "string" && _visibility.toLowerCase() === "admin" ? "admin" : "public";

  return {
    ...rest,
    limit: parseInteger(limit),
    visibility,
    includes:
      Array.isArray(includes) && includes.every(i => typeof i === "string")
        ? (includes as string[])
        : [],
  };
};
