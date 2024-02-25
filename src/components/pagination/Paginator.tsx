"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { Pagination } from "@mantine/core";
import clsx from "clsx";
import clamp from "lodash.clamp";
import { z } from "zod";

import { type ComponentProps } from "~/components/types";

export interface PaginatorProps extends Pick<ComponentProps, "className"> {
  readonly count: number;
  readonly pageSize?: number;
}

/* Note: We will eventually be replacing usage of Mantine's Pagination component here with our own
   internal Pagination component.  We should also consider incorporating the ability to change
   page size. */
export const Paginator = ({ count, pageSize = 10, ...props }: PaginatorProps) => {
  const [activePage, _setPage] = useState(1);
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const page = searchParams?.get("page");
    if (page) {
      const parsed = z.coerce.number().int().positive().safeParse(page);
      if (parsed.success) {
        _setPage(clamp(parsed.data, 1, Math.ceil(count / clamp(pageSize, 1, 100))));
      }
    }
  }, [searchParams, pageSize, count]);

  const setPage = useCallback(
    (page: number) => {
      _setPage(page);
      const params = new URLSearchParams(searchParams?.toString());
      params.set("page", page.toString());
      replace(`${pathname}?${params.toString()}`);
    },
    [pathname, searchParams, replace],
  );

  return (
    <Pagination
      className={clsx("paginator", props.className)}
      value={activePage}
      onChange={setPage}
      // Setting the total to 0 causes the paginator to disappear.
      total={Math.max(1, Math.ceil(count / clamp(pageSize, 1, 100)))}
    />
  );
};

export default Paginator;
