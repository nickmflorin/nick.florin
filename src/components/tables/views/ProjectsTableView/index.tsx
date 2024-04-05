import dynamic from "next/dynamic";
import { Suspense } from "react";

import { Button } from "~/components/buttons";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Loading } from "~/components/feedback/Loading";
import { TextInput } from "~/components/input/TextInput";
import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { TableSearchBar } from "~/components/tables/generic/TableSearchBar";
import { TableView as RootTableView } from "~/components/tables/generic/TableView";

import { ControlBar } from "./ControlBar";
import { Paginator } from "./Paginator";
import { ProjectsAdminTable } from "./Table";
import { type Filters } from "./types";

const TableViewProvider = dynamic(() => import("./Provider"), {
  loading: () => <Loading isLoading={true} />,
});

const SearchInput = dynamic(() => import("~/components/tables/generic/TableSearchInput"), {
  loading: () => <TextInput isLoading={true} />,
});

const NewProjectButton = dynamic(() => import("./NewProjectButton"), {
  loading: () => <Button.Primary isDisabled={true}>New</Button.Primary>,
});

interface ProjectsTableViewProps {
  readonly filters: Filters;
  readonly page: number;
}

export const ProjectsTableView = ({ filters, page }: ProjectsTableViewProps) => (
  <TableViewProvider>
    <RootTableView
      searchBar={
        <TableSearchBar>
          <SearchInput searchParamName="search" />
          <NewProjectButton />
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
          <ProjectsAdminTable filters={filters} page={page} />
        </Suspense>
      </ErrorBoundary>
    </RootTableView>
  </TableViewProvider>
);
