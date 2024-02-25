import dynamic from "next/dynamic";
import { Suspense } from "react";

import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { TableSearchBarPlaceholder } from "~/components/tables/TableSearchBarPlaceholder";
import { TableView } from "~/components/tables/TableView";
import { Loading } from "~/components/views/Loading";

import { SkillsAdminTable } from "./SkillsAdminTable";
import { SkillsAdminTablePaginator } from "./SkillsAdminTablePaginator";

const TableSearchBar = dynamic(() => import("./SkillsAdminTableSearchBar"), {
  loading: () => <TableSearchBarPlaceholder />,
});

interface SkillsPageProps {
  readonly searchParams: { readonly search?: string; readonly page?: string };
}

export default async function SkillsPage({ searchParams: { search, page } }: SkillsPageProps) {
  return (
    <TableView
      searchBar={<TableSearchBar />}
      paginator={
        <Suspense fallback={<PaginatorPlaceholder />}>
          <SkillsAdminTablePaginator search={search} />
        </Suspense>
      }
    >
      <Suspense key={search} fallback={<Loading loading={true} />}>
        <SkillsAdminTable search={search} page={page} />
      </Suspense>
    </TableView>
  );
}
