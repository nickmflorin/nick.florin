"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { TabButton } from "~/components/buttons/TabButton";
import { DrawerIds } from "~/components/drawers";
import { DynamicLoading, DynamicLoader } from "~/components/feedback/dynamic-loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <DynamicLoader />,
});

export const ResumesAdminTab = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <DynamicLoading>
      {({ isLoading }) => (
        <>
          <TabButton
            options={{ as: "button" }}
            icon={{ name: "list-check" }}
            isActive={drawerOpen}
            isLoading={isLoading}
            onClick={() => setDrawerOpen(true)}
          >
            Resumes
          </TabButton>
          {drawerOpen && (
            <ClientDrawer
              id={DrawerIds.VIEW_RESUMES}
              props={{}}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </>
      )}
    </DynamicLoading>
  );
};
