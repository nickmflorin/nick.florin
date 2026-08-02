import { type ComponentType, type JSX, useCallback, useState } from 'react';

import type * as types from '../types';

import { DrawerContainer } from '~/components/drawers/DrawerContainer';

import { type DrawerDynamicProps, getDrawerComponent } from '../drawers';

export const useDrawersManager = (): Omit<types.DrawersManager, 'isInScope'> => {
  const [drawer, setDrawer] = useState<JSX.Element | null>(null);
  const [drawerId, setDrawerId] = useState<null | types.DrawerId>(null);

  const close = useCallback(() => {
    setDrawer(null);
    setDrawerId(null);
  }, []);

  const open = useCallback(
    <D extends types.DrawerId>(id: D, props: DrawerDynamicProps<D>) => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const Drawer = getDrawerComponent(id) as ComponentType<any>;
      const ps = { ...props, onClose: () => close() };

      setDrawer(
        <DrawerContainer>
          <Drawer {...ps} />
        </DrawerContainer>,
      );
      setDrawerId(id);
    },
    [close],
  );

  return { close, drawer, drawerId, open };
};
