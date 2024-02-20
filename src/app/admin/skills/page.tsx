import dynamic from "next/dynamic";
import { Suspense } from "react";

import { preloadEducations } from "~/fetches/get-educations";
import { preloadExperiences } from "~/fetches/get-experiences";
import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { Loading } from "~/components/views/Loading";

import { SearchInput } from "./SearchInput";
import SkillsAdminTable from "./SkillsAdminTable";
import { ServerUpdateSkillForm } from "./UpdateSkillForm";

const Drawer = dynamic(() => import("~/components/drawers/Drawer"), {
  loading: () => <Loading loading={true} />,
});

interface SkillsPageProps {
  readonly searchParams: { readonly search?: string; readonly updateSkillId?: string };
}

export default async function SkillsPage({
  searchParams: { search, updateSkillId },
}: SkillsPageProps) {
  preloadEducations({});
  preloadExperiences({});

  let drawer: JSX.Element | null = null;
  if (updateSkillId) {
    drawer = (
      <Drawer open={true}>
        {/* Must be wrapped in Suspense because it accesses useSearchParams. */}
        <Suspense key={updateSkillId} fallback={<Loading loading={true} />}>
          <ServerUpdateSkillForm skillId={updateSkillId} />
          <Suspense>
            <DrawerCloseButton param="updateSkillId" />
          </Suspense>
        </Suspense>
      </Drawer>
    );
  }
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
      {drawer}
    </>
  );
}
