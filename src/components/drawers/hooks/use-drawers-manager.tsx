import React, { useState, useCallback } from "react";

import type * as types from "../types";

import { DrawerContainer } from "~/components/drawers/DrawerContainer";

import { getDrawerComponent } from "../drawers";
import { type DrawerDynamicProps } from "../drawers";

export const useDrawersManager = (): Omit<types.DrawersManager, "isInScope"> => {
  const [drawer, setDrawer] = useState<JSX.Element | null>(null);
  const [drawerId, setDrawerId] = useState<types.DrawerId | null>(null);

  const close = useCallback(() => {
    setDrawer(null);
    setDrawerId(null);
  }, []);

  const open = useCallback(
    <D extends types.DrawerId>(id: D, props: DrawerDynamicProps<D>) => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const Drawer = getDrawerComponent(id) as React.ComponentType<any>;
      const ps = { ...props, onClose: () => close() } as React.ComponentProps<typeof Drawer>;

      setDrawer(
        <DrawerContainer>
          <Drawer {...ps} />
        </DrawerContainer>,
      );
      setDrawerId(id);
    },
    [close],
  );

  return { drawer, drawerId, open, close };
};
