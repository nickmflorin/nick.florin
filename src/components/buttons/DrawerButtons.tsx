import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { classNames } from "~/components/types";

export interface DrawerButtonsProps {
  readonly onClose?: () => void;
}

export const DrawerButtons = ({ onClose }: DrawerButtonsProps) => {
  const { close } = useDrawers();
  return (
    <div
      className={classNames(
        "flex flex-row items-center justify-between",
        "absolute z-50 top-[14px] right-[12px]",
      )}
    >
      <DrawerCloseButton
        onClick={() => {
          close();
          onClose?.();
        }}
      />
    </div>
  );
};
