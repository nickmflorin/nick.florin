import dynamic from "next/dynamic";
import { Suspense } from "react";

import { type GetCoursesFilters } from "~/actions/fetches/courses";

import { DrawerIds } from "~/components/drawers";
import { ErrorBoundary } from "~/components/errors/ErrorBoundary";
import { TextInput } from "~/components/input/TextInput";
import { Loading } from "~/components/loading/Loading";
import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { NewButton } from "~/components/tables/NewButton";
import { TableSearchBar } from "~/components/tables/TableSearchBar";
import { TableView as RootTableView } from "~/components/tables/TableView";

import { ControlBar } from "./ControlBar";
import { Paginator } from "./Paginator";
import { CoursesAdminTable } from "./Table";

const TableViewProvider = dynamic(() => import("./Provider"), {
  loading: () => <Loading isLoading={true} />,
});

const SearchInput = dynamic(() => import("~/components/tables/TableSearchInput"), {
  loading: () => <TextInput isLoading={true} />,
});

interface CoursesTableViewProps {
  readonly filters: GetCoursesFilters;
  readonly page: number;
}

export const CoursesTableView = ({ filters, page }: CoursesTableViewProps) => (
  <TableViewProvider>
    <RootTableView
      searchBar={
        <TableSearchBar>
          <SearchInput initialValue={filters.search} />
          <NewButton drawerId={DrawerIds.CREATE_COURSE} />
        </TableSearchBar>
      }
      controlBar={<ControlBar />}
      paginator={
        <Suspense fallback={<PaginatorPlaceholder />}>
          <Paginator filters={filters} />
        </Suspense>
      }
    >
      <ErrorBoundary message="There was an error rendering the table.">
        <Suspense key={`${filters.search}`} fallback={<Loading isLoading={true} />}>
          <CoursesAdminTable filters={filters} page={page} />
        </Suspense>
      </ErrorBoundary>
    </RootTableView>
  </TableViewProvider>
);
