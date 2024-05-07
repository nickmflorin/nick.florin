import type * as types from "./types";

import { DrawerContainer } from "../DrawerContainer";

import { getDrawerComponent } from "./drawers";

interface DrawerRendererProps<D extends types.DrawerId> {
  readonly id: D;
  readonly props: types.DrawerDynamicProps<D>;
}

export const DrawerRenderer = <D extends types.DrawerId>({ id, props }: DrawerRendererProps<D>) => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const Drawer = getDrawerComponent(id) as React.ComponentType<any>;
  const ps = props as React.ComponentProps<typeof Drawer>;

  return (
    <DrawerContainer>
      <Drawer {...ps} />
    </DrawerContainer>
  );
};

export default DrawerRenderer;
