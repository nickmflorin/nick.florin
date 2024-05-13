"use client";
import dynamic from "next/dynamic";

import { TabButton } from "~/components/buttons/TabButton";
import { DrawerIds } from "~/components/drawers";
import { useDrawerState } from "~/components/drawers/hooks/use-drawer-state";
import { DynamicLoading, DynamicLoader } from "~/components/feedback/dynamic-loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <DynamicLoader />,
});

export const ResumesAdminTab = () => {
  const { isOpen, open } = useDrawerState({ drawerId: DrawerIds.VIEW_RESUMES, props: {} });
  return (
    <DynamicLoading>
      {({ isLoading }) => (
        <>
          <TabButton
            as="button"
            icon={{ name: "list-check" }}
            isActive={isOpen}
            isLoading={isLoading}
            onClick={() => open()}
          >
            Resumes
          </TabButton>
          {isOpen && <ClientDrawer id={DrawerIds.VIEW_RESUMES} props={{}} />}
        </>
      )}
    </DynamicLoading>
  );
};
