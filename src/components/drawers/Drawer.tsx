import { type ReactNode } from "react";

import clsx from "clsx";

import { DrawerButtons } from "~/components/buttons/DrawerButtons";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { type ComponentProps } from "~/components/types";

export interface DrawerProps extends ComponentProps {
  readonly children: ReactNode;
}

export const Drawer = ({ children, ...props }: DrawerProps): JSX.Element => (
  <div {...props} className={clsx("drawer", props.className)}>
    <ErrorBoundary>{children}</ErrorBoundary>
    <DrawerButtons />
  </div>
);

export default Drawer;
