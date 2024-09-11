import dynamic from "next/dynamic";
import { Suspense } from "react";

import { type GetExperiencesFilters } from "~/actions/fetches/experiences";

import { DrawerIds } from "~/components/drawers";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Loading } from "~/components/feedback/Loading";
import { TextInput } from "~/components/input/TextInput";
import { CompaniesSchoolsDropdownMenu } from "~/components/menus/CompaniesSchoolsDropdownMenu";
import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { NewButton } from "~/components/tables/generic/NewButton";
import { TableSearchBar } from "~/components/tables/generic/TableSearchBar";
import { TableView as RootTableView } from "~/components/tables/generic/TableView";

import { ControlBar } from "./ControlBar";
import { Paginator } from "./Paginator";
import { TableViewProvider } from "./Provider";
import { ExperiencesAdminTable } from "./Table";

const SearchInput = dynamic(() => import("~/components/tables/generic/TableSearchInput"), {
  loading: () => <TextInput isLoading={true} />,
});

interface TableViewProps {
  readonly filters: Omit<GetExperiencesFilters, "highlighted">;
  readonly page: number;
}

export const ExperiencesTableView = ({ filters, page }: TableViewProps) => (
  <TableViewProvider>
    <RootTableView
      searchBar={
        <TableSearchBar>
          <SearchInput initialValue={filters.search} />
          <NewButton drawerId={DrawerIds.CREATE_EXPERIENCE} />
          <CompaniesSchoolsDropdownMenu modelType="company" />
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
          <ExperiencesAdminTable filters={filters} page={page} />
        </Suspense>
      </ErrorBoundary>
    </RootTableView>
  </TableViewProvider>
);
