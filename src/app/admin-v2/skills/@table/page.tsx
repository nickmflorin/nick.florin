import dynamic from "next/dynamic";
import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { SkillsDefaultOrdering, SkillsFiltersObj } from "~/actions-v2";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables-v2";
import { SkillsTableColumns } from "~/features/skills";
import { SkillsTablePaginator } from "~/features/skills/components/tables-v2/SkillsTablePaginator";

import { SkillsTableBody } from "./SkillsTableBody";
import { SkillsTableFilterBar } from "./SkillsTableFilterBar";

const SkillsTableView = dynamic(
  () =>
    import("~/features/skills/components/tables-v2/SkillsTableView").then(
      mod => mod.SkillsTableView,
    ),
  { loading: () => <Loading isLoading /> },
);

const DataTableProvider = dynamic(
  () => import("~/components/tables-v2/DataTableProvider").then(mod => mod.DataTableProvider),
  {
    loading: () => <Loading isLoading />,
  },
);

export interface SkillsTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default function SkillsTablePage({ searchParams }: SkillsTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = SkillsFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: SkillsDefaultOrdering,
    fields: SkillsTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <DataTableProvider
      columns={SkillsTableColumns}
      controlBarTargetId="skills-admin-table-control-bar"
      rowsAreDeletable
      rowsAreSelectable
      rowsHaveActions
    >
      <SkillsTableView
        filterBar={
          <Suspense>
            <SkillsTableFilterBar filters={filters} />
          </Suspense>
        }
        pagination={<SkillsTablePaginator filters={filters} page={page} />}
      >
        <Suspense
          key={JSON.stringify(filters) + JSON.stringify(ordering) + String(page)}
          fallback={<Loading isLoading component="tbody" />}
        >
          <SkillsTableBody filters={filters} page={page} ordering={ordering} />
        </Suspense>
      </SkillsTableView>
    </DataTableProvider>
  );
}
