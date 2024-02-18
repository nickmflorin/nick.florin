import { Suspense } from "react";

import { Loading } from "~/components/views/Loading";

import { SearchInput } from "./SearchInput";
import SkillsAdminTable from "./SkillsAdminTable";

export default async function SkillsPage({
  searchParams: { search },
}: {
  searchParams: { search?: string };
}) {
  return (
    <>
      <Suspense>
        <SearchInput className="mb-[18px]" />
      </Suspense>
      <div className="grow overflow-hidden w-full relative">
        <Suspense key={search} fallback={<Loading loading={true} />}>
          <SkillsAdminTable search={search} />
        </Suspense>
      </div>
    </>
  );
}
