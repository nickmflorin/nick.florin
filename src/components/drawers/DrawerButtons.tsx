import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";
import { classNames } from "~/components/types";

export interface DrawerButtonsProps {
  readonly onClose?: () => void;
}

export const DrawerButtons = ({ onClose }: DrawerButtonsProps) =>
  onClose ? (
    <div
      className={classNames(
        "flex flex-row items-center justify-between",
        "absolute z-50 top-[14px] right-[12px]",
      )}
    >
      <DrawerCloseButton onClick={() => onClose()} />
    </div>
  ) : (
    <></>
  );
