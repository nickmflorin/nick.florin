import dynamicfn from "next/dynamic";
import { Suspense } from "react";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { UpdateExperienceForm } from "~/components/forms/experiences/UpdateExperienceForm";
import { Loading } from "~/components/views/Loading";

const Drawer = dynamicfn(() => import("~/components/drawers/Drawer"), {
  loading: () => <Loading loading={true} />,
});

interface ExperiencesDrawerProps {
  readonly searchParams: { readonly updateExperienceId?: string };
}

export default async function ExperiencesDrawer({ searchParams }: ExperiencesDrawerProps) {
  const { updateExperienceId } = searchParams;
  if (!updateExperienceId) {
    return null;
  }
  return (
    <Drawer open={true}>
      {/* Must be wrapped in Suspense because it accesses useSearchParams. */}
      <Suspense key={updateExperienceId} fallback={<Loading loading={true} />}>
        <UpdateExperienceForm experienceId={updateExperienceId} />
        <DrawerCloseButton param="updateExperienceId" />
      </Suspense>
    </Drawer>
  );
}
