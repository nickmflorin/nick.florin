import { type NextRequest } from "next/server";

import clamp from "lodash.clamp";

import { decodeQueryParam, encodeQueryParam } from "~/lib/urls";
import { type Includes } from "~/prisma/model";

export type Visibility = "public" | "admin";

export const parseVisibility = (request: NextRequest): Visibility => {
  const params = request.nextUrl.searchParams;
  const v = params.get("visibility");
  return v?.toLowerCase() === "admin" ? "admin" : "public";
};

export type PaginationParams<F> = {
  readonly page?: number;
  readonly filters?: F;
  readonly pageSize?: number;
  readonly visibility: Visibility;
  readonly getCount: (params: { filters?: F; visibility?: Visibility }) => Promise<number>;
};

export type Pagination<F> = {
  readonly page: number;
  readonly filters?: F;
  readonly count: number;
  readonly numPages: number;
  readonly pageSize: number;
};

export const parsePagination = async <F>({
  filters,
  page,
  pageSize = 10,
  visibility,
  getCount,
}: PaginationParams<F>): Promise<Pagination<F> | null> => {
  const pg = page ? Math.max(page, 1) : undefined;
  if (pg) {
    const count = await getCount({ filters, visibility });
    const numPages = Math.max(Math.ceil(count / pageSize), 1);
    return { page: clamp(pg, 1, numPages), numPages, count, filters, pageSize };
  }
  return null;
};

export const encodeInclusionQuery = <I extends Includes>(includes: I): string => {
  const positives = Object.keys(includes).reduce(
    (prev: string[], curr: string) => (includes[curr as keyof I] === true ? [...prev, curr] : prev),
    [],
  );
  return encodeQueryParam(positives);
};

export const decodeInclusionQuery = <F extends string>(
  fields: F[],
  param: string | undefined | null,
): Includes<F> => {
  if (param) {
    const parsed = decodeQueryParam(param, {});
    if (Array.isArray(parsed)) {
      const includedFields = parsed.filter((p): p is F => fields.includes(String(p) as F));
      return includedFields.reduce((prev, curr) => ({ ...prev, [curr]: true }), {} as Includes<F>);
    }
  }
  return {};
};

export const parseInclusion = <F extends string>(
  request: NextRequest,
  fields: F[],
): Includes<F> => {
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
