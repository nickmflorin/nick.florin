"use client";
import React, { useState, useCallback } from "react";

import type * as types from "./types";

import { DrawerCloseButton } from "~/components/buttons/DrawerCloseButton";

import { DrawerContainer } from "../DrawerContainer";

import { getDrawerComponent } from "./drawers";

export const useDrawersManager = (): Omit<types.DrawersManager, "isReady"> => {
  const [drawer, setDrawer] = useState<JSX.Element | null>(null);

  const close = useCallback(() => {
    setDrawer(null);
  }, []);

  const open = useCallback(
    <D extends types.DrawerId>(id: D, props: types.DrawerDynamicProps<D>, handler?: () => void) => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const Drawer = getDrawerComponent(id) as React.ComponentType<any>;
      const ps = {
        ...props,
        onClose: () => setDrawer(null),
      } as React.ComponentProps<typeof Drawer>;

      setDrawer(
        <DrawerContainer>
          <Drawer {...ps} />
          <DrawerCloseButton
            onClick={() => {
              handler?.();
              setDrawer(null);
            }}
          />
        </DrawerContainer>,
      );
    },
    [],
  );

  return { drawer, open, close };
};
