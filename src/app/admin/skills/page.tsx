import { Suspense } from "react";

import { PaginatorPlaceholder } from "~/components/pagination/PaginatorPlaceholder";
import { Loading } from "~/components/views/Loading";

import { SkillsAdminTable } from "./SkillsAdminTable";
import { SkillsAdminTableControlBar } from "./SkillsAdminTableControlBar";
import { SkillsAdminTablePaginator } from "./SkillsAdminTablePaginator";

interface SkillsPageProps {
  readonly searchParams: { readonly search?: string; readonly page?: string };
}

export default async function SkillsPage({ searchParams: { search, page } }: SkillsPageProps) {
  return (
    <div className="flex flex-col gap-[16px] h-full relative overflow-hidden">
      <SkillsAdminTableControlBar />
      <div
        className="flex flex-grow flex-col"
        style={{ height: "calc(100% - 64px - 32px)", maxHeight: "calc(100% - 64px - 32px)" }}
      >
        <Suspense key={search} fallback={<Loading loading={true} />}>
          <SkillsAdminTable search={search} page={page} />
        </Suspense>
      </div>
      <Suspense fallback={<PaginatorPlaceholder />}>
        <SkillsAdminTablePaginator search={search} />
      </Suspense>
    </div>
  );
}
