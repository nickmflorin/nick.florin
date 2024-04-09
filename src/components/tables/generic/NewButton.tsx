"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "~/components/buttons";
import { type DrawerId } from "~/components/drawers";
import { DynamicLoading, DynamicLoader } from "~/components/feedback/dynamic-loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <DynamicLoader />,
});

export interface NewButtonProps {
  readonly drawerId: DrawerId;
}

export const NewButton = ({ drawerId }: NewButtonProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <DynamicLoading>
      {({ isLoading }) => (
        <>
          <Button.Primary isLoading={isLoading} onClick={() => setDrawerOpen(true)}>
            New
          </Button.Primary>
          {drawerOpen && (
            <ClientDrawer id={drawerId} props={{}} onClose={() => setDrawerOpen(false)} />
          )}
        </>
      )}
    </DynamicLoading>
  );
};

export default NewButton;
