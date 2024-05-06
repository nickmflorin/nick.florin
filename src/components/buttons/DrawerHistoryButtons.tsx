import { forwardRef } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { DrawerHistoryButton } from "./DrawerHistoryButton";

export interface DrawerHistoryButtonsProps extends ComponentProps {
  readonly forwardEnabled?: boolean;
  readonly backEnabled?: boolean;
  readonly onForward?: () => void;
  readonly onBack?: () => void;
}

export const DrawerHistoryButtons = forwardRef<HTMLDivElement, DrawerHistoryButtonsProps>(
  (
    { forwardEnabled = false, backEnabled = false, onForward, onBack, ...props },
    ref,
  ): JSX.Element => (
    <div
      {...props}
      ref={ref}
      className={clsx("flex flex-row items-center gap-[6px]", props.className)}
    >
      <DrawerHistoryButton direction="back" isDisabled={!backEnabled} onClick={onBack} />
      <DrawerHistoryButton direction="forward" isDisabled={!forwardEnabled} onClick={onForward} />
    </div>
  ),
);

export default DrawerHistoryButtons;
