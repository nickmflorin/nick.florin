'use client';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useOptimistic, useTransition } from 'react';

import { clamp } from 'lodash-es';
import { z } from 'zod';

import { classNames, type ComponentProps } from '~/components/types';

const Pagination = dynamic(() => import('@mantine/core').then(mod => mod.Pagination));

export interface PaginatorProps extends Pick<ComponentProps, 'className'> {
  readonly count: number;
  readonly page?: number;
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
 * Navigates to `url` inside a transition, so that server-side pagination components relying on the
 * new page's data continue to show stale content while it is fetched, rather than the server-side
 * suspense boundaries rendering their fallback.
 */
const navigateToPageWithTransition = (
  startTransition: (callback: () => void) => void,
  replace: (url: string) => void,
  url: string,
) => startTransition(() => replace(url));

/**
 * Returns the page that the paginator should show, which is the page in the URL unless the page was
 * provided explicitly as a prop.
 *
 * The page in the URL is clamped to the range that the count and page size allow, and a URL without
 * a usable page falls back to the first page.
 */
const getActivePage = (
  searchParams: URLSearchParams,
  { count, page, pageSize }: { count: number; page?: number; pageSize: number },
): number => {
  if (page !== undefined) {
    return page;
  }
  const parsed = z.coerce.number().int().positive().safeParse(searchParams.get('page'));
  return parsed.success ? clamp(parsed.data, 1, Math.ceil(count / clamp(pageSize, 1, 100))) : 1;
};

export const Paginator = ({ count, page, pageSize = 10, ...props }: PaginatorProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [_, startTransition] = useTransition();

  /* The page is held optimistically so that the paginator highlights the page that was clicked for
     as long as the navigation to it is still in flight.  The transition that performs the
     navigation deliberately keeps the previous page's content on screen while its data is fetched,
     which would otherwise leave the previous page highlighted for the duration of the fetch. */
  const [activePage, setActivePage] = useOptimistic(
    getActivePage(new URLSearchParams(searchParams.toString()), { count, page, pageSize }),
  );

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      navigateToPageWithTransition(
        startTransition,
        url => {
          setActivePage(newPage);
          router.replace(url);
        },
        `${pathname}?${params.toString()}`,
      );
    },
    [pathname, searchParams, router, setActivePage],
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
