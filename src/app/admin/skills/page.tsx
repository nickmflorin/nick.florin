import dynamic from "next/dynamic";
import { Suspense } from "react";

import { z } from "zod";

import { decodeQueryParam } from "~/lib/urls";
import { preloadEducations } from "~/fetches/get-educations";
import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { TableSearchBarPlaceholder } from "~/components/tables/TableSearchBarPlaceholder";
import { TableView } from "~/components/tables/TableView";
import { Loading } from "~/components/views/Loading";

import { SkillsAdminTable } from "./SkillsAdminTable";
import { SkillsAdminTableControlBar } from "./SkillsAdminTableControlBar";
import { SkillsAdminTablePaginator } from "./SkillsAdminTablePaginator";

const TableSearchBar = dynamic(() => import("./SkillsAdminTableSearchBar"), {
  loading: () => <TableSearchBarPlaceholder />,
});

interface SkillsPageProps {
  readonly searchParams: {
    readonly search?: string;
    readonly page?: string;
    readonly checkedRows?: string;
    readonly educations?: string;
    readonly experiences?: string;
  };
}

export default async function SkillsPage({
  searchParams: { search, checkedRows, page: _page, educations: _educations, experiences },
}: SkillsPageProps) {
  /* We might want to look into setting a maximum here so that we don't wind up with empty results
     when the page is too large. */
  const page = z.coerce.number().min(1).int().default(1).parse(_page);
  preloadEducations({ skills: true });

  const educations = _educations
    ? decodeQueryParam(_educations, { form: ["array"] as const }) ?? []
    : [];

  const filters = { educations, search: search ?? "" };

  return (
    <TableView
      searchBar={<TableSearchBar />}
      controlBar={<SkillsAdminTableControlBar checkedRows={checkedRows} filters={filters} />}
      paginator={
        <Suspense fallback={<PaginatorPlaceholder />}>
          <SkillsAdminTablePaginator filters={filters} />
        </Suspense>
      }
    >
      <Suspense key={search} fallback={<Loading loading={true} />}>
        <SkillsAdminTable filters={filters} page={page} />
      </Suspense>
    </TableView>
  );
}
