import dynamic from "next/dynamic";
import { Suspense } from "react";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
/* eslint-disable-next-line max-len */
import { UpdateEducationDetailsForm } from "~/components/forms/educations/UpdateEducationDetailsForm";
import { UpdateEducationForm } from "~/components/forms/educations/UpdateEducationForm";
import { Loading } from "~/components/views/Loading";

const Drawer = dynamic(() => import("~/components/drawers/Drawer"));

interface EducationsDrawerProps {
  readonly searchParams: {
    readonly updateEducationId?: string;
    readonly updateEducationDetailsId?: string;
  };
}

export default async function EducationsDrawer({ searchParams }: EducationsDrawerProps) {
  const { updateEducationId, updateEducationDetailsId } = searchParams;

  if (updateEducationDetailsId) {
    return (
      <Drawer className="pl-[16px] pb-[16px] pt-[16px]">
        <Suspense key={updateEducationDetailsId} fallback={<Loading loading={true} />}>
          <UpdateEducationDetailsForm educationId={updateEducationDetailsId} />
          <DrawerCloseButton param="updateEducationDetailsId" />
        </Suspense>
      </Drawer>
    );
  } else if (updateEducationId) {
    return (
      <Drawer>
        {/* Must be wrapped in Suspense because it accesses useSearchParams. */}
        <Suspense key={updateEducationId} fallback={<Loading loading={true} />}>
          <UpdateEducationForm educationId={updateEducationId} />
          <DrawerCloseButton param="updateEducationId" />
        </Suspense>
      </Drawer>
    );
  }
  return null;
}
