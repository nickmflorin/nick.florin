import dynamic from "next/dynamic";
import { Suspense } from "react";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { UpdateExperienceForm } from "~/components/forms/experiences/UpdateExperienceForm";
import { Loading } from "~/components/views/Loading";

const Drawer = dynamic(() => import("~/components/drawers/Drawer"));

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
      <Suspense key={updateExperienceId} fallback={<Loading loading={true} />}>
        <UpdateExperienceForm experienceId={updateExperienceId} />
        <DrawerCloseButton param="updateExperienceId" />
      </Suspense>
    </Drawer>
  );
}
