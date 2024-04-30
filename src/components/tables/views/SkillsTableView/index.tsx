import dynamic from "next/dynamic";
import { Suspense } from "react";

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
import { SkillsAdminTable } from "./Table";
import { type Filters } from "./types";

const TableViewProvider = dynamic(() => import("./Provider"), {
  loading: () => <Loading isLoading={true} />,
});

const SearchInput = dynamic(() => import("~/components/tables/generic/TableSearchInput"), {
  loading: () => <TextInput isLoading={true} />,
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
          <Suspense fallback={<TextInput isLoading={true} />}>
            <SearchInput initialValue={filters.search} />
          </Suspense>
          <NewButton drawerId={DrawerIds.CREATE_SKILL} />
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
          fallback={<Loading isLoading={true} />}
        >
          <SkillsAdminTable filters={filters} page={page} />
        </Suspense>
      </ErrorBoundary>
    </RootTableView>
  </TableViewProvider>
);
