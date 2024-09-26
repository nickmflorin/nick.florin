import dynamic from "next/dynamic";
import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { RepositoriesDefaultOrdering, RepositoriesFiltersObj } from "~/actions-v2";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables-v2";
import { RepositoriesTableColumns } from "~/features/repositories";
import { RepositoriesTableControlBarPlaceholder } from "~/features/repositories/components/tables-v2/RepositoriesTableControlBarPlaceholder";
import { RepositoriesTablePaginator } from "~/features/repositories/components/tables-v2/RepositoriesTablePaginator";

import { RepositoriesTableBody } from "./RepositoriesTableBody";
import { RepositoriesTableFilterBar } from "./RepositoriesTableFilterBar";

const RepositoriesTableView = dynamic(
  () =>
    import("~/features/repositories/components/tables-v2/RepositoriesTableView").then(
      mod => mod.RepositoriesTableView,
    ),
  { loading: () => <Loading isLoading /> },
);

const DataTableProvider = dynamic(
  () => import("~/components/tables-v2/DataTableProvider").then(mod => mod.DataTableProvider),
  {
    loading: () => <Loading isLoading />,
  },
);

export interface RepositoriesTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default function RepositoriesTablePage({ searchParams }: RepositoriesTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = RepositoriesFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: RepositoriesDefaultOrdering,
    fields: RepositoriesTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });
  return (
    <DataTableProvider
      columns={RepositoriesTableColumns}
      controlBarTargetId="repositories-admin-table-control-bar"
      rowsAreDeletable
      rowsAreSelectable
      rowsHaveActions
    >
      <RepositoriesTableView
        filterBar={
          <Suspense>
            <RepositoriesTableFilterBar filters={filters} />
          </Suspense>
        }
        pagination={<RepositoriesTablePaginator filters={filters} page={page} />}
      >
        <Suspense
          key={JSON.stringify(filters) + JSON.stringify(ordering) + String(page)}
          fallback={
            <>
              <RepositoriesTableControlBarPlaceholder />
              <Loading isLoading component="tbody" />
            </>
          }
        >
          <RepositoriesTableBody filters={filters} page={page} ordering={ordering} />
        </Suspense>
      </RepositoriesTableView>
    </DataTableProvider>
  );
}
