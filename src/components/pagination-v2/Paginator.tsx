"use client";
import dynamic from "next/dynamic";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useTransition } from "react";

import { clamp } from "lodash-es";
import { z } from "zod";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

const Pagination = dynamic(() => import("@mantine/core").then(mod => mod.Pagination));

export interface PaginatorProps extends Pick<ComponentProps, "className"> {
  readonly count: number;
  readonly page?: number;
  readonly pageSize?: number;
}

export const Paginator = ({ count, page, pageSize = 10, ...props }: PaginatorProps) => {
  const [activePage, _setPage] = useState(1);
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
  const [_, startTransition] = useTransition();

  useEffect(() => {
    const pg = searchParams?.get("page");
    if (pg) {
      const parsed = z.coerce.number().int().positive().safeParse(pg);
      if (parsed.success) {
        _setPage(clamp(parsed.data, 1, Math.ceil(count / clamp(pageSize, 1, 100))));
      }
    }
  }, [searchParams, pageSize, count]);

  useEffect(() => {
    if (page !== undefined) {
      _setPage(page);
    }
  }, [page]);

  const setPage = useCallback(
    (page: number) => {
      _setPage(page);
      const params = new URLSearchParams(searchParams?.toString());
      params.set("page", page.toString());
      /* We wrap the pagination change in a transition to allow the server side pagination
         components that are relying on this data to show stale content before the new page data
         is fetched.  If we did not do this, the server side suspense boundaries would render the
         fallback - which we do not want (we want to show the stale content). */
      startTransition(() => {
        replace(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, searchParams, replace],
  );

  return (
    <Pagination
      className={classNames("paginator", props.className)}
      value={activePage}
      onChange={setPage}
      // Setting the total to 0 causes the paginator to disappear.
      total={Math.max(1, Math.ceil(count / clamp(pageSize, 1, 100)))}
    />
  );
};

export default Paginator;
