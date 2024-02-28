"use client";
import {
  useSearchParams,
  usePathname,
  useRouter,
  type ReadonlyURLSearchParams,
} from "next/navigation";
import {
  forwardRef,
  type ForwardedRef,
  useMemo,
  useState,
  useEffect,
  useTransition,
  useCallback,
} from "react";

import uniq from "lodash.uniq";
import uniqBy from "lodash.uniqby";
import { z } from "zod";

import { decodeQueryParams, encodeQueryParam } from "~/lib/urls";
import { Checkbox } from "~/components/input/Checkbox";

import { RootTable } from "./RootTable";
import { type TableModel, type TableProps, type TableInstance } from "./types";

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

export const Table = forwardRef(
  <T extends TableModel>(
    { isCheckable, columns: _columns, ...props }: TableProps<T>,
    ref?: ForwardedRef<TableInstance<T>>,
  ) => {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [checked, setChecked] = useState<T[]>([]);
    const [_, transition] = useTransition();

    useEffect(() => {
      const parsed = parseCheckedRowsFromQuery({ searchParams });
      const parsedModels = props.data.filter(d => parsed.includes(d.id));
      setChecked(parsedModels);
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
    useEffect(() => {
      const parsed = parseCheckedRowsFromQuery({ searchParams });
      const parsedModels = props.data.filter(d => parsed.includes(d.id));
      setCheckedRowsQuery(parsedModels.map(m => m.id));
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [props.data]);

    const columns = useMemo(() => {
      if (isCheckable) {
        return [
          {
            id: "checkable",
            title: "",
            accessor: "checkable",
            width: "40px",
            cellsClassName: "loading-cell",
            render: ({ model }) => (
              <div className="flex flex-row items-center justify-center">
                <Checkbox
                  value={checked.map(m => m.id).includes(model.id)}
                  onChange={e => {
                    let newCheckedRows: string[] = [];

                    // Optimistically update in state immediately.
                    setChecked(curr => {
                      if (e.target.checked) {
                        return [...uniqBy(curr, c => c.id).filter(m => m.id !== model.id), model];
                      }
                      return uniqBy(
                        curr.filter(m => m.id !== model.id),
                        m => m.id,
                      );
                    });

                    transition(() => {
                      const existing = parseCheckedRowsFromQuery({ searchParams });
                      if (e.target.checked) {
                        newCheckedRows = [...uniq(existing), model.id];
                      } else {
                        newCheckedRows = uniq(existing.filter(id => id !== model.id));
                      }
                      setCheckedRowsQuery(newCheckedRows);
                    });
                  }}
                />
              </div>
            ),
          },
          ..._columns,
        ];
      }
      return _columns;
    }, [_columns, isCheckable, checked, searchParams, setCheckedRowsQuery]);

    return <RootTable<T> {...props} ref={ref} columns={columns} />;
  },
) as {
  <T extends TableModel>(
    props: TableProps<T> & { readonly ref?: ForwardedRef<TableInstance<T>> },
  ): JSX.Element;
};

export default Table;
