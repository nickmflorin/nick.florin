import dynamic from "next/dynamic";
import { Suspense } from "react";

import { Button } from "~/components/buttons";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { TextInput } from "~/components/input/TextInput";
import { CompaniesSchoolsDropdownMenu } from "~/components/menus/CompaniesSchoolsDropdownMenu";
import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { Loading } from "~/components/views/Loading";

import { TableSearchBar } from "../TableSearchBar";
import { TableView as RootTableView } from "../TableView";

import { ControlBar } from "./ControlBar";
import { Paginator } from "./Paginator";
import { TableViewProvider } from "./Provider";
import { EducationsAdminTable } from "./Table";
import { type Filters } from "./types";

const SearchInput = dynamic(() => import("../TableSearchInput"), {
  loading: () => <TextInput isLoading={true} />,
});

const NewExperienceButton = dynamic(() => import("./NewEducationButton"), {
  loading: () => <Button.Primary isDisabled={true}>New</Button.Primary>,
});

interface TableViewProps {
  readonly filters: Filters;
  readonly page: number;
}

export const EducationsTableView = ({ filters, page }: TableViewProps) => (
  <TableViewProvider>
    <RootTableView
      searchBar={
        <TableSearchBar>
          <SearchInput searchParamName="search" />
          <NewExperienceButton />
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
        <Suspense key={`${filters.search}`} fallback={<Loading loading={true} />}>
          <EducationsAdminTable filters={filters} page={page} />
        </Suspense>
      </ErrorBoundary>
    </RootTableView>
  </TableViewProvider>
);
