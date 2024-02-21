import { Suspense } from "react";

import { preloadEducations } from "~/fetches/get-educations";
import { preloadExperiences } from "~/fetches/get-experiences";
import { Loading } from "~/components/views/Loading";

import { SearchInput } from "./SearchInput";
import SkillsAdminTable from "./SkillsAdminTable";

interface SkillsPageProps {
  readonly searchParams: { readonly search?: string };
}

export default async function SkillsPage({ searchParams: { search } }: SkillsPageProps) {
  preloadEducations({});
  preloadExperiences({});

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
