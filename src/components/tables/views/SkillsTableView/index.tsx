import dynamic from "next/dynamic";
import { Suspense } from "react";

import { Button } from "~/components/buttons";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { TextInput } from "~/components/input/TextInput";
import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { TableSearchBar } from "~/components/tables/generic/TableSearchBar";
import { TableView as RootTableView } from "~/components/tables/generic/TableView";
import { Loading } from "~/components/views/Loading";

import { ControlBar } from "./ControlBar";
import { Paginator } from "./Paginator";
import { SkillsAdminTable } from "./Table";
import { type Filters } from "./types";

const TableViewProvider = dynamic(() => import("./Provider"), {
  loading: () => <Loading loading={true} />,
});

const SearchInput = dynamic(() => import("~/components/tables/generic/TableSearchInput"), {
  loading: () => <TextInput isLoading={true} />,
});

const NewSkillButton = dynamic(() => import("./NewSkillButton"), {
  loading: () => <Button.Primary isDisabled={true}>New</Button.Primary>,
});

interface SkillsTableViewProps {
  readonly filters: Filters;
  readonly page: number;
}

export const SkillsTableView = ({ filters, page }: SkillsTableViewProps) => (
  <TableViewProvider>
    <RootTableView
      searchBar={
        <TableSearchBar>
          <SearchInput searchParamName="search" />
          <NewSkillButton />
        </TableSearchBar>
      }
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
