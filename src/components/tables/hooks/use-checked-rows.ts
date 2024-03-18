import { useSearchParams, type ReadonlyURLSearchParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition, useCallback } from "react";

import uniq from "lodash.uniq";
import { z } from "zod";

import type * as types from "../types";

import { decodeQueryParams, encodeQueryParam } from "~/lib/urls";

const CheckedRowsQuerySchema = z
  .object({
    checkedRows: z.array(z.string()),
  })
  .passthrough();

const parseCheckedRowsFromQuery = ({
  searchParams,
}: {
  searchParams: ReadonlyURLSearchParams | null;
}) => {
  /* We treat the following cases the same:
     1. The search params are not present at all.
     2. The search params are present, but the 'checkedRows' key is missing.
     3. The search params are present, the 'checkedRows' key is present, but the value is invalid.

     In each case, we don't want to use the existing potential search parameters to modify the
     checked rows param, because it either does not exist or is invalid. */
  if (searchParams) {
    const parsed = CheckedRowsQuerySchema.safeParse(decodeQueryParams(searchParams));
    if (parsed.success) {
      return parsed.data.checkedRows;
    }
  }
  return [];
};

export const useCheckedRows = <T extends types.TableModel>({
  // data,
  useQueryParams = false,
  enabled = true,
}: {
  // readonly data: T[];
  readonly enabled?: boolean;
  readonly useQueryParams?: boolean;
}): [T["id"][], { check: (m: T | T["id"]) => void; uncheck: (m: T["id"]) => void }] => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [checked, _setChecked] = useState<T["id"][]>([]);
  const [_, transition] = useTransition();

  useEffect(() => {
    if (useQueryParams && enabled) {
      const parsed = parseCheckedRowsFromQuery({ searchParams });
      _setChecked(parsed);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [searchParams]);

  const setCheckedRowsQuery = useCallback(
    (checkedRows: string[]) => {
      const newParams = new URLSearchParams(searchParams?.toString());
      if (checkedRows.length !== 0) {
        newParams.set("checkedRows", encodeQueryParam(checkedRows));
      } else {
        newParams.delete("checkedRows");
      }
      transition(() => {
        replace(`${pathname}?${newParams.toString()}`);
      });
    },
    [searchParams, pathname, replace],
  );

  /* Note: If we remove this effect, the checked rows will not be cleared when switching from
     page to page of the paginated table.  This may be desirable in the future, but for now we
     will wipe the checked rows when the page changes. */
  // useEffect(() => {
  //   if (enabled) {
  //     const parsed = parseCheckedRowsFromQuery({ searchParams });
  //     const parsedModels = data.filter(d => parsed.includes(d.id));
  //     setCheckedRowsQuery(parsedModels.map(m => m.id));
  //   }
  //   /* eslint-disable-next-line react-hooks/exhaustive-deps */
  // }, [data]);

  const check = useCallback(
    (m: T | T["id"]) => {
      if (enabled) {
        const id = typeof m === "string" ? m : m.id;

        /* Optimistically update in state immediately, regardless of whether or not we are using
           query parameters. */
        _setChecked(curr => [...uniq(curr).filter(mi => mi !== id), id]);

        if (useQueryParams) {
          transition(() => {
            const existing = parseCheckedRowsFromQuery({ searchParams });
            setCheckedRowsQuery([...uniq(existing).filter(mi => mi !== id), id]);
          });
        }
      }
    },
    [setCheckedRowsQuery, searchParams, useQueryParams, enabled],
  );

  const uncheck = useCallback(
    (m: T["id"] | T) => {
      if (enabled) {
        const id = typeof m === "string" ? m : m.id;

        /* Optimistically update in state immediately, regardless of whether or not we are using
           query parameters. */
        _setChecked(curr => uniq(curr.filter(mi => mi !== id)));
        if (useQueryParams) {
          transition(() => {
            const existing = parseCheckedRowsFromQuery({ searchParams });
            setCheckedRowsQuery(uniq(existing.filter(mi => mi !== id)));
          });
        }
      }
    },
    [setCheckedRowsQuery, useQueryParams, searchParams, enabled],
  );

  return [checked, { check, uncheck }];
};
