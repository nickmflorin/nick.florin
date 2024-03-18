import dynamic from "next/dynamic";
import { Suspense } from "react";

import { ErrorBoundary } from "~/components/ErrorBoundary";
import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { Loading } from "~/components/views/Loading";

import { TableViewProvider } from "../Provider";
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
}

export const SkillsTableView = ({ filters, page }: SkillsTableViewProps) => (
  <TableViewProvider id="skills-table" isCheckable={true}>
    <RootTableView
      searchBar={<TableSearchBar />}
      controlBar={<ControlBar filters={filters} page={page} />}
      paginator={
        <Suspense fallback={<PaginatorPlaceholder />}>
          <Paginator filters={filters} />
        </Suspense>
      }
    >
      <ErrorBoundary message="There was an error rendering the table.">
        <Suspense
          key={`${filters.search}-${filters.experiences}-${filters.educations}`}
          fallback={<Loading loading={true} />}
        >
          <SkillsAdminTable filters={filters} page={page} />
        </Suspense>
      </ErrorBoundary>
    </RootTableView>
  </TableViewProvider>
);
