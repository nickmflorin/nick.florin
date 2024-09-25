import dynamic from "next/dynamic";
import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { CoursesDefaultOrdering, CoursesFiltersObj } from "~/actions-v2";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables-v2";
import { CoursesTableColumns } from "~/features/courses";
import { CoursesTableControlBarPlaceholder } from "~/features/courses/components/tables-v2/CoursesTableControlBarPlaceholder";
import { CoursesTablePaginator } from "~/features/courses/components/tables-v2/CoursesTablePaginator";

import { CoursesTableBody } from "./CoursesTableBody";
import { CoursesTableFilterBar } from "./CoursesTableFilterBar";

const CoursesTableView = dynamic(
  () =>
    import("~/features/courses/components/tables-v2/CoursesTableView").then(
      mod => mod.CoursesTableView,
    ),
  { loading: () => <Loading isLoading /> },
);

const DataTableProvider = dynamic(
  () => import("~/components/tables-v2/DataTableProvider").then(mod => mod.DataTableProvider),
  {
    loading: () => <Loading isLoading />,
  },
);

export interface CoursesTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default function CoursesTablePage({ searchParams }: CoursesTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = CoursesFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: CoursesDefaultOrdering,
    fields: CoursesTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });
  return (
    <DataTableProvider
      columns={CoursesTableColumns}
      controlBarTargetId="courses-admin-table-control-bar"
      rowsAreDeletable
      rowsAreSelectable
      rowsHaveActions
    >
      <CoursesTableView
        filterBar={
          <Suspense>
            <CoursesTableFilterBar filters={filters} />
          </Suspense>
        }
        pagination={<CoursesTablePaginator filters={filters} page={page} />}
      >
        <Suspense
          key={JSON.stringify(filters) + JSON.stringify(ordering) + String(page)}
          fallback={
            <>
              <CoursesTableControlBarPlaceholder />
              <Loading isLoading component="tbody" />
            </>
          }
        >
          <CoursesTableBody filters={filters} page={page} ordering={ordering} />
        </Suspense>
      </CoursesTableView>
    </DataTableProvider>
  );
}
