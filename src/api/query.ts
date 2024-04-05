import { type NextRequest } from "next/server";

import clamp from "lodash.clamp";
import uniq from "lodash.uniq";

import { decodeQueryParam } from "~/lib/urls";

export type Visibility = "public" | "admin";

export const parseVisibility = (request: NextRequest): Visibility => {
  const params = request.nextUrl.searchParams;
  const v = params.get("visibility");
  return v?.toLowerCase() === "admin" ? "admin" : "public";
};

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

export const decodeInclusionQuery = <F extends readonly string[]>(
  fields: F,
  param: string | undefined | null,
): F[number][] => {
  if (param) {
    const parsed = decodeQueryParam(param, {});
    if (Array.isArray(parsed)) {
      return uniq(parsed.filter((p): p is F[number] => fields.includes(String(p) as F[number])));
    }
  }
  return [];
};

export const parseInclusion = <F extends readonly string[]>(
  request: NextRequest,
  fields: F,
): F[number][] => {
  const params = request.nextUrl.searchParams;
  const v = params.get("includes");
  return decodeInclusionQuery(fields, v);
};

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
