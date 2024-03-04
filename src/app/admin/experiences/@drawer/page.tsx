import dynamic from "next/dynamic";
import { Suspense } from "react";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
/* eslint-disable-next-line max-len */
import { UpdateExperienceDetailsForm } from "~/components/forms/experiences/UpdateExperienceDetailsForm";
import { UpdateExperienceForm } from "~/components/forms/experiences/UpdateExperienceForm";
import { Loading } from "~/components/views/Loading";

const Drawer = dynamic(() => import("~/components/drawers/Drawer"));

interface ExperiencesDrawerProps {
  readonly searchParams: {
    readonly updateExperienceId?: string;
    readonly updateExperienceDetailsId?: string;
  };
}

export default async function ExperiencesDrawer({ searchParams }: ExperiencesDrawerProps) {
  const { updateExperienceId, updateExperienceDetailsId } = searchParams;

  if (updateExperienceDetailsId) {
    return (
      <Drawer>
        <Suspense key={updateExperienceDetailsId} fallback={<Loading loading={true} />}>
          <UpdateExperienceDetailsForm experienceId={updateExperienceDetailsId} />
          <DrawerCloseButton param="updateExperienceDetailsId" />
        </Suspense>
      </Drawer>
    );
  } else if (updateExperienceId) {
    return (
      <Drawer>
        <Suspense key={updateExperienceId} fallback={<Loading loading={true} />}>
          <UpdateExperienceForm experienceId={updateExperienceId} />
          <DrawerCloseButton param="updateExperienceId" />
        </Suspense>
      </Drawer>
    );
  }
  return null;
}
