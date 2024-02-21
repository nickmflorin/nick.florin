import { Suspense } from "react";

import { getEducations } from "~/fetches/get-educations";
import { getExperiences } from "~/fetches/get-experiences";
import { Loading } from "~/components/views/Loading";

import { SearchInput } from "./SearchInput";
import SkillsAdminTable from "./SkillsAdminTable";

interface SkillsPageProps {
  readonly searchParams: { readonly search?: string };
}

const getTableData = async (search: string | undefined) => {
  const _skills = await prisma.skill.findMany({
    where: { AND: constructOrSearch(search, ["slug", "label"]) },
    orderBy: { createdAt: "desc" },
  });
  return await includeSkillMetadata(_skills);
};

export default async function SkillsPage({ searchParams: { search } }: SkillsPageProps) {
  /* preloadEducations({});
     preloadExperiences({}); */

  const educations = await getEducations({});
  const experiences = await getExperiences({});
  const skills = await getTableData(search);

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
