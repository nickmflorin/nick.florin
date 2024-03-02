import dynamicfn from "next/dynamic";
import { Suspense } from "react";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { UpdateEducationForm } from "~/components/forms/educations/UpdateEducationForm";
import { Loading } from "~/components/views/Loading";

const Drawer = dynamicfn(() => import("~/components/drawers/Drawer"), {
  loading: () => <Loading loading={true} />,
});

interface EducationsDrawerProps {
  readonly searchParams: { readonly updateEducationId?: string };
}

export default async function EducationsDrawer({ searchParams }: EducationsDrawerProps) {
  const { updateEducationId } = searchParams;
  if (!updateEducationId) {
    return null;
  }
  return (
    <Drawer open={true}>
      {/* Must be wrapped in Suspense because it accesses useSearchParams. */}
      <Suspense key={updateEducationId} fallback={<Loading loading={true} />}>
        <UpdateEducationForm educationId={updateEducationId} />
        <DrawerCloseButton param="updateEducationId" />
      </Suspense>
    </Drawer>
  );
}
