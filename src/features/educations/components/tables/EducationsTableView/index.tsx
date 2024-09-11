import dynamic from "next/dynamic";
import { Suspense } from "react";

import { type GetEducationsFilters } from "~/actions/fetches/educations";

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
import { EducationsAdminTable } from "./Table";

const SearchInput = dynamic(() => import("~/components/tables/generic/TableSearchInput"), {
  loading: () => <TextInput isLoading={true} />,
});

interface TableViewProps {
  readonly filters: Omit<GetEducationsFilters, "highlighted">;
  readonly page: number;
}

export const EducationsTableView = ({ filters, page }: TableViewProps) => (
  <TableViewProvider>
    <RootTableView
      searchBar={
        <TableSearchBar>
          <SearchInput initialValue={filters.search} />
          <NewButton drawerId={DrawerIds.CREATE_EDUCATION} />
          <CompaniesSchoolsDropdownMenu modelType="school" />
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
          <EducationsAdminTable filters={filters} page={page} />
        </Suspense>
      </ErrorBoundary>
    </RootTableView>
  </TableViewProvider>
);
