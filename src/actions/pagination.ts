import clamp from "lodash.clamp";

import { type Visibility } from "./visibility";

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
