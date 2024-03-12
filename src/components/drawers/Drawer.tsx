import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { DrawerContainer } from "./DrawerContainer";

const DrawerPortal = dynamic(() => import("./DrawerPortal"));
const DrawerCloseButton = dynamic(() => import("~/components/buttons/DrawerCloseButton"));

export interface DrawerProps extends ComponentProps {
  readonly children: ReactNode;
  readonly inPortal?: boolean;
  readonly onClose?: () => void;
}

const LocalDrawer = ({
  children,
  onClose,
  ...props
}: Omit<DrawerProps, "inPortal">): JSX.Element => (
  <div {...props} className={clsx("drawer", props.className)}>
    {children}
    {onClose && <DrawerCloseButton onClick={onClose} />}
  </div>
);

export const Drawer = ({ inPortal = false, ...props }: DrawerProps): JSX.Element =>
  inPortal ? (
    <DrawerPortal>
      <DrawerContainer>
        <LocalDrawer {...props} />
      </DrawerContainer>
    </DrawerPortal>
  ) : (
    <DrawerContainer>
      <LocalDrawer {...props} />
    </DrawerContainer>
  );

export default Drawer;
