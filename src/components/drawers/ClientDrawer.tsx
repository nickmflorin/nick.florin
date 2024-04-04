"use client";
import { useEffect } from "react";

import { useDrawers } from "./hooks";
import { type DrawerId } from "./provider/types";
import { type DrawerDynamicProps } from "./provider/use-drawers-manager";

export interface ClientDrawerProps<D extends DrawerId> {
  readonly id: D;
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
  readonly props: DrawerDynamicProps<D>;
}

export const ClientDrawer = <D extends DrawerId>({
  id,
  props,
  onClose,
  isOpen = true,
}: ClientDrawerProps<D>): JSX.Element => {
  const { open } = useDrawers();

  useEffect(() => {
    if (isOpen) {
      open(id, props, onClose);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [id, props, open, isOpen]);

  return <></>;
};

export default ClientDrawer;
