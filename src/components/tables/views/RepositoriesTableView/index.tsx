import dynamic from "next/dynamic";
import { Suspense } from "react";

import { type GetRepositoriesFilters } from "~/actions/fetches/repositories";
import { DrawerIds } from "~/components/drawers";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Loading } from "~/components/feedback/Loading";
import { TextInput } from "~/components/input/TextInput";
import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { NewButton } from "~/components/tables/generic/NewButton";
import { TableSearchBar } from "~/components/tables/generic/TableSearchBar";
import { TableView as RootTableView } from "~/components/tables/generic/TableView";

import { ControlBar } from "./ControlBar";
import { Paginator } from "./Paginator";
import { RepositoriesAdminTable } from "./Table";

const TableViewProvider = dynamic(() => import("./Provider"), {
  loading: () => <Loading isLoading={true} />,
});

const SearchInput = dynamic(() => import("~/components/tables/generic/TableSearchInput"), {
  loading: () => <TextInput isLoading={true} />,
});

const SyncRepositoriesButton = dynamic(() => import("./SyncRepositoriesButton"));

interface RepositoriesTableViewProps {
  readonly filters: Omit<GetRepositoriesFilters, "highlighted">;
  readonly page: number;
}

export const RepositoriesTableView = ({ filters, page }: RepositoriesTableViewProps) => (
  <TableViewProvider>
    <RootTableView
      searchBar={
        <TableSearchBar>
          <SearchInput initialValue={filters.search} />
          <NewButton drawerId={DrawerIds.CREATE_REPOSITORY} />
          <SyncRepositoriesButton />
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
          <RepositoriesAdminTable filters={filters} page={page} />
        </Suspense>
      </ErrorBoundary>
    </RootTableView>
  </TableViewProvider>
);
