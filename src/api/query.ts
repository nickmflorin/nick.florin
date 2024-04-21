import clamp from "lodash.clamp";

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

export type ApiStandardDetailQuery<I extends string[]> = {
  readonly includes: I;
  readonly visibility: Visibility;
};

export type ApiStandardListQuery<
  I extends string[],
  F extends Record<string, unknown> | never = never,
  O = never,
> = ApiStandardDetailQuery<I> & {
  readonly limit?: number;
  readonly page?: number;
  /* Note: We should consider incorporating a way to provide a schema to the parser so it can
     automatically validate filter structures if present. */
  readonly filters?: F;
  /* Note: We need to figure out a way to validate the orderBy parameter so that we do not get
     Prisma errors with bad input from query params. */
  readonly orderBy?: O | O[];
};

export interface ApiParsedQuery<I extends string[] = string[]> extends ApiStandardListQuery<I> {
  readonly [key: string]: ParsedQueryValue;
}

export const parseApiQuery = <I extends string[]>(
  query: URLSearchParams | Record<string, string>,
): ApiParsedQuery<I> => {
  const transformed: Record<string, string> =
    query instanceof URLSearchParams ? transformQueryParams(query, { form: "record" }) : query;

  const { visibility: _visibility, includes, page, limit, ...rest } = parseQuery(transformed);

  const visibility: Visibility =
    typeof _visibility === "string" && _visibility.toLowerCase() === "admin" ? "admin" : "public";

  return {
    ...rest,
    limit: typeof limit === "number" ? Number(limit.toFixed(0)) : undefined,
    page: typeof page === "number" ? Number(page.toFixed(0)) : undefined,
    visibility,
    includes:
      /* Note: This coercion is somewhat dangerous, because the values in the array are not
         guaranteed to be a valid set of inclusion parameters for a given model, but can have other,
         invalid strings as well.  However, the extent at which we are using inclusion is limited to
         making decisions based on the presence of specific strings inside of the array - so it
         should suffice for now.

         We may want to incorporate stricter validation checks in the near future, however. */
      Array.isArray(includes) && includes.every(i => typeof i === "string")
        ? (includes as string[] as I)
        : ([] as string[] as I),
  };
};
