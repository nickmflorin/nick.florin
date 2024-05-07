"use client";
import dynamic from "next/dynamic";

import { Button } from "~/components/buttons";
import { type DrawerId } from "~/components/drawers";
import { useDrawerState } from "~/components/drawers/hooks/use-drawer-state";
import { DynamicLoading, DynamicLoader } from "~/components/feedback/dynamic-loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <DynamicLoader />,
});

export interface NewButtonProps {
  readonly drawerId: DrawerId;
}

export const NewButton = ({ drawerId }: NewButtonProps) => {
  const { isOpen, open } = useDrawerState();
  return (
    <DynamicLoading>
      {({ isLoading }) => (
        <>
          <Button.Primary isLoading={isLoading} onClick={() => open()}>
            New
          </Button.Primary>
          {isOpen && <ClientDrawer id={drawerId} props={{}} />}
        </>
      )}
    </DynamicLoading>
  );
};

export default NewButton;
