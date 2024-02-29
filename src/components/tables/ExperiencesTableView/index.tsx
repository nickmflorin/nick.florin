import dynamic from "next/dynamic";
import { Suspense } from "react";

import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { Loading } from "~/components/views/Loading";

import { TableSearchBarPlaceholder } from "../TableSearchBarPlaceholder";
import { TableView as RootTableView } from "../TableView";

import { ControlBar } from "./ControlBar";
import { Paginator } from "./Paginator";
import { ExperiencesAdminTable } from "./Table";
import { type Filters } from "./types";

const TableSearchBar = dynamic(() => import("~/components/tables/SkillsTableView/SearchBar"), {
  loading: () => <TableSearchBarPlaceholder />,
});

interface TableViewProps {
  readonly filters: Filters;
  readonly page: number;
  readonly checkedRows: string[];
}

export const ExperiencesTableView = ({ filters, page, checkedRows }: TableViewProps) => (
  <RootTableView
    searchBar={<TableSearchBar />}
    controlBar={<ControlBar checkedRows={checkedRows} />}
    paginator={
      <Suspense fallback={<PaginatorPlaceholder />}>
        <Paginator filters={filters} />
      </Suspense>
    }
  >
    <Suspense key={`${filters.search}`} fallback={<Loading loading={true} />}>
      <ExperiencesAdminTable filters={filters} page={page} />
    </Suspense>
  </RootTableView>
);
