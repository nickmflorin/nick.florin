import { clamp } from 'lodash-es';

export type ServerSidePaginationParams = {
  readonly count: number;
  readonly page: number;
  readonly pageSize: number;
};

export const clampPagination = (params: ServerSidePaginationParams) => {
  const count = clamp(params.count, 0, Infinity);
  const pageSize = clamp(params.pageSize, 1, Infinity);
  const page = clamp(params.page, 1, clamp(Math.ceil(params.count / pageSize), 1, Infinity));
  return { count, page, pageSize };
};
