import dynamic from "next/dynamic";
import { Suspense } from "react";

import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { Loading } from "~/components/views/Loading";

import { TableSearchBarPlaceholder } from "../TableSearchBarPlaceholder";
import { TableView as RootTableView } from "../TableView";

import { ControlBar } from "./ControlBar";
import { Paginator } from "./Paginator";
import { SkillsAdminTable } from "./Table";
import { type Filters } from "./types";

const TableSearchBar = dynamic(() => import("./SearchBar"), {
  loading: () => <TableSearchBarPlaceholder />,
});

interface SkillsTableViewProps {
  readonly filters: Filters;
  readonly page: number;
  readonly checkedRows: string[];
}

export const SkillsTableView = ({ filters, page, checkedRows }: SkillsTableViewProps) => (
  <RootTableView
    searchBar={<TableSearchBar />}
    controlBar={<ControlBar checkedRows={checkedRows} filters={filters} page={page} />}
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
