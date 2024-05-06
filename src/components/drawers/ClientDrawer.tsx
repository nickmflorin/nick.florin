"use client";
import { useEffect, useRef } from "react";

import { useDrawers } from "./hooks";
import { type ClientDrawerProps } from "./provider";
import { type DrawerId } from "./provider/types";

export const ClientDrawer = <D extends DrawerId>({
  id,
  props,
  push,
  onClose,
}: ClientDrawerProps<D>): JSX.Element => {
  const { open } = useDrawers();
  const wasOpened = useRef<boolean>(false);

  useEffect(() => {
    if (!wasOpened.current) {
      open(id, props, { closeHandler: onClose, push });
      wasOpened.current = true;
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  return <></>;
};

export default ClientDrawer;
