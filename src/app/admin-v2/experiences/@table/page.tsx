import dynamic from "next/dynamic";
import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { ExperiencesDefaultOrdering, ExperiencesFiltersObj } from "~/actions-v2";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables-v2";
import { ExperiencesTableColumns } from "~/features/experiences";
import { ExperiencesTableControlBarPlaceholder } from "~/features/experiences/components/tables-v2/ExperiencesTableControlBarPlaceholder";
import { ExperiencesTablePaginator } from "~/features/experiences/components/tables-v2/ExperiencesTablePaginator";

import { ExperiencesTableBody } from "./ExperiencesTableBody";
import { ExperiencesTableFilterBar } from "./ExperiencesTableFilterBar";

const ExperiencesTableView = dynamic(
  () =>
    import("~/features/experiences/components/tables-v2/ExperiencesTableView").then(
      mod => mod.ExperiencesTableView,
    ),
  { loading: () => <Loading isLoading /> },
);

const DataTableProvider = dynamic(
  () => import("~/components/tables-v2/DataTableProvider").then(mod => mod.DataTableProvider),
  {
    loading: () => <Loading isLoading />,
  },
);

export interface ExperiencesTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default function ExperiencesTablePage({ searchParams }: ExperiencesTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = ExperiencesFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: ExperiencesDefaultOrdering,
    fields: ExperiencesTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });
  return (
    <DataTableProvider
      columns={ExperiencesTableColumns}
      controlBarTargetId="experiences-admin-table-control-bar"
      rowsAreDeletable
      rowsAreSelectable
      rowsHaveActions
    >
      <ExperiencesTableView
        filterBar={
          <Suspense>
            <ExperiencesTableFilterBar filters={filters} />
          </Suspense>
        }
        pagination={<ExperiencesTablePaginator filters={filters} page={page} />}
      >
        <Suspense
          key={JSON.stringify(filters) + JSON.stringify(ordering) + String(page)}
          fallback={
            <>
              <ExperiencesTableControlBarPlaceholder />
              <Loading isLoading component="tbody" />
            </>
          }
        >
          <ExperiencesTableBody filters={filters} page={page} ordering={ordering} />
        </Suspense>
      </ExperiencesTableView>
    </DataTableProvider>
  );
}
