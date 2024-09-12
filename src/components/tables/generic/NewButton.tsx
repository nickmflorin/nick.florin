"use client";
import dynamic from "next/dynamic";

import { Button } from "~/components/buttons";
import { useDrawerState } from "~/components/drawers/hooks/use-drawer-state";
import { DynamicLoading, DynamicLoader } from "~/components/feedback/dynamic-loading";

const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {
  loading: () => <DynamicLoader />,
});

export interface NewButtonProps {
  readonly drawerId: DrawerId;
}

export const NewButton = ({ drawerId }: NewButtonProps) => {
  const { isOpen, open } = useDrawerState({ drawerId, props: {} });
  return (
    <DynamicLoading>
      {({ isLoading }) => (
        <>
          <Button.Solid isLoading={isLoading} scheme="primary" onClick={() => open()}>
            New
          </Button.Solid>
          {isOpen && <ClientDrawer id={drawerId} props={{}} />}
        </>
      )}
    </DynamicLoading>
  );
};

export default NewButton;
