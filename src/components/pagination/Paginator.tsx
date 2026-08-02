'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { Pagination } from '@mantine/core';
import { clamp } from 'lodash-es';
import { z } from 'zod';

import { classNames, type ComponentProps } from '~/components/types';

export interface PaginatorProps extends Pick<ComponentProps, 'className'> {
  readonly count: number;
  readonly pageSize?: number;
}

/**
 * The total page count passed to the paginator.
 *
 * The paginator disappears if its `total` is set to `0`, so the value is clamped to a minimum of
 * `1`.
 */
const getPaginatorTotal = (count: number, pageSize: number): number =>
  Math.max(1, Math.ceil(count / clamp(pageSize, 1, 100)));

/**
 * Returns the page that the paginator should show, clamped to the range that the count and page
 * size allow.  A URL without a usable page falls back to the first page.
 */
const getActivePage = (
  searchParams: URLSearchParams,
  { count, pageSize }: { count: number; pageSize: number },
): number => {
  const parsed = z.coerce.number().int().positive().safeParse(searchParams.get('page'));
  return parsed.success ? clamp(parsed.data, 1, Math.ceil(count / clamp(pageSize, 1, 100))) : 1;
};

export const Paginator = ({ count, pageSize = 10, ...props }: PaginatorProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activePage = getActivePage(new URLSearchParams(searchParams.toString()), {
    count,
    pageSize,
  });

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, searchParams, router],
  );

  return (
    <Pagination
      className={classNames('paginator', props.className)}
      onChange={setPage}
      total={getPaginatorTotal(count, pageSize)}
      value={activePage}
    />
  );
};
