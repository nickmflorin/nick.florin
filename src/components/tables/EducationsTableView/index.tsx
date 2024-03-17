import dynamic from "next/dynamic";
import { Suspense } from "react";

import { ErrorBoundary } from "~/components/ErrorBoundary";
import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { Loading } from "~/components/views/Loading";

import { TableSearchBarPlaceholder } from "../TableSearchBarPlaceholder";
import { TableView as RootTableView } from "../TableView";

import { ControlBar } from "./ControlBar";
import { Paginator } from "./Paginator";
import { EducationsAdminTable } from "./Table";
import { type Filters } from "./types";

const TableSearchBar = dynamic(() => import("./SearchBar"), {
  loading: () => <TableSearchBarPlaceholder />,
});

interface TableViewProps {
  readonly filters: Filters;
  readonly page: number;
  readonly checkedRows: string[];
}

export const EducationsTableView = ({ filters, page, checkedRows }: TableViewProps) => (
  <RootTableView
    searchBar={<TableSearchBar />}
    controlBar={<ControlBar checkedRows={checkedRows} />}
    paginator={
      <Suspense fallback={<PaginatorPlaceholder />}>
        <Paginator filters={filters} />
      </Suspense>
    }
  >
    <ErrorBoundary message="There was an error rendering the table.">
      <Suspense key={`${filters.search}`} fallback={<Loading loading={true} />}>
        <EducationsAdminTable filters={filters} page={page} />
      </Suspense>
    </ErrorBoundary>
  </RootTableView>
);
