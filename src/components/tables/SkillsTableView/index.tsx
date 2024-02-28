import dynamic from "next/dynamic";
import { Suspense } from "react";

import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { SkillsAdminTable } from "~/components/tables/SkillsTableView/Table";
import { TableSearchBarPlaceholder } from "~/components/tables/TableSearchBarPlaceholder";
import { TableView as RootTableView } from "~/components/tables/TableView";
import { Loading } from "~/components/views/Loading";

import { ControlBar } from "./ControlBar";
import { Paginator } from "./Paginator";
import { type Filters } from "./types";

const TableSearchBar = dynamic(() => import("~/components/tables/SkillsTableView/SearchBar"), {
  loading: () => <TableSearchBarPlaceholder />,
});

interface TableViewProps {
  readonly filters: Filters;
  readonly page: number;
  readonly checkedRows: string[];
}

export const SkillsTableView = ({ filters, page, checkedRows }: TableViewProps) => (
  <RootTableView
    searchBar={<TableSearchBar />}
    controlBar={<ControlBar checkedRows={checkedRows} filters={filters} />}
    paginator={
      <Suspense fallback={<PaginatorPlaceholder />}>
        <Paginator filters={filters} />
      </Suspense>
    }
  >
    <Suspense
      key={`${filters.search}-${filters.experiences}-${filters.educations}`}
      fallback={<Loading loading={true} />}
    >
      <SkillsAdminTable filters={filters} page={page} />
    </Suspense>
  </RootTableView>
);
