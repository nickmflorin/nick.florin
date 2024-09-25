import dynamic from "next/dynamic";
import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { EducationsDefaultOrdering, EducationsFiltersObj } from "~/actions-v2";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables-v2";
import { EducationsTableColumns } from "~/features/educations";
import { EducationsTableControlBarPlaceholder } from "~/features/educations/components/tables-v2/EducationsTableControlBarPlaceholder";
import { EducationsTablePaginator } from "~/features/educations/components/tables-v2/EducationsTablePaginator";

import { EducationsTableBody } from "./EducationsTableBody";
import { EducationsTableFilterBar } from "./EducationsTableFilterBar";

const EducationsTableView = dynamic(
  () =>
    import("~/features/educations/components/tables-v2/EducationsTableView").then(
      mod => mod.EducationsTableView,
    ),
  { loading: () => <Loading isLoading /> },
);

const DataTableProvider = dynamic(
  () => import("~/components/tables-v2/DataTableProvider").then(mod => mod.DataTableProvider),
  {
    loading: () => <Loading isLoading />,
  },
);

export interface EducationsTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default function EducationsTablePage({ searchParams }: EducationsTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = EducationsFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: EducationsDefaultOrdering,
    fields: EducationsTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });
  return (
    <DataTableProvider
      columns={EducationsTableColumns}
      controlBarTargetId="educations-admin-table-control-bar"
      rowsAreDeletable
      rowsAreSelectable
      rowsHaveActions
    >
      <EducationsTableView
        filterBar={
          <Suspense>
            <EducationsTableFilterBar filters={filters} />
          </Suspense>
        }
        pagination={<EducationsTablePaginator filters={filters} page={page} />}
      >
        <Suspense
          key={JSON.stringify(filters) + JSON.stringify(ordering) + String(page)}
          fallback={
            <>
              <EducationsTableControlBarPlaceholder />
              <Loading isLoading component="tbody" />
            </>
          }
        >
          <EducationsTableBody filters={filters} page={page} ordering={ordering} />
        </Suspense>
      </EducationsTableView>
    </DataTableProvider>
  );
}
