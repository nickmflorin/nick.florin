import dynamic from "next/dynamic";

import clsx from "clsx";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { ShowHide } from "~/components/util";

const DrawerHistoryButtons = dynamic(() => import("./DrawerHistoryButtons"));

export interface DrawerButtonsProps {
  readonly onClose?: () => void;
}

export const DrawerButtons = ({ onClose }: DrawerButtonsProps) => {
  const { backEnabled, forwardEnabled, close, back, forward } = useDrawers();
  return (
    <div
      className={clsx(
        "flex flex-row items-center justify-between",
        "absolute z-50 top-[14px] right-[12px]",
      )}
    >
      <ShowHide show={backEnabled || forwardEnabled}>
        <DrawerHistoryButtons
          backEnabled={backEnabled}
          forwardEnabled={forwardEnabled}
          onBack={() => back()}
          onForward={() => forward()}
        />
      </ShowHide>
      <DrawerCloseButton
        onClick={() => {
          close();
          onClose?.();
        }}
      />
    </div>
  );
};
