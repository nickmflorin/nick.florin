import { type ReactNode, type JSX } from "react";

import { ErrorBoundary } from "~/components/errors/ErrorBoundary";
import { type ComponentProps, classNames } from "~/components/types";

import { DrawerButtons } from "./DrawerButtons";
import { DrawerContent } from "./DrawerContent";
import { DrawerFooter } from "./DrawerFooter";
import { DrawerHeader } from "./DrawerHeader";

export interface DrawerProps extends ComponentProps {
  readonly children: ReactNode;
  readonly onClose: () => void;
}

const LocalDrawer = ({ children, onClose, ...props }: DrawerProps): JSX.Element => (
  <div {...props} className={classNames("drawer", props.className)}>
    <ErrorBoundary>{children}</ErrorBoundary>
    <DrawerButtons onClose={onClose} />
  </div>
);

export const Drawer = Object.assign(LocalDrawer, {
  displayName: "Drawer",
  Content: DrawerContent,
  Header: DrawerHeader,
  Footer: DrawerFooter,
});
