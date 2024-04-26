"use client";
import { useEffect } from "react";

import { useDrawers } from "./hooks";
import { type ClientDrawerProps } from "./provider";
import { type DrawerId } from "./provider/types";

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
  }, [isOpen]);

  return <></>;
};

export default ClientDrawer;
