import dynamicfn from "next/dynamic";
import { Suspense } from "react";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { Loading } from "~/components/views/Loading";

import { ServerUpdateSkillForm } from "../UpdateSkillForm";

export const dynamic = "force-static";

const Drawer = dynamicfn(() => import("~/components/drawers/Drawer"), {
  loading: () => <Loading loading={true} />,
});

interface SkillsPageProps {
  readonly searchParams: { readonly updateSkillId?: string };
}

export default async function SkillsPage({ searchParams }: SkillsPageProps) {
  const { updateSkillId } = searchParams;
  if (!updateSkillId) {
    return null;
  }
  return (
    <Drawer open={true}>
      {/* Must be wrapped in Suspense because it accesses useSearchParams. */}
      <Suspense key={updateSkillId} fallback={<Loading loading={true} />}>
        <ServerUpdateSkillForm skillId={updateSkillId} />
        <DrawerCloseButton param="updateSkillId" searchParams={searchParams.toString()} />
      </Suspense>
    </Drawer>
  );
}
