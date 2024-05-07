import type * as types from "./types";

import { DrawerContainer } from "../DrawerContainer";

import { getDrawerComponent } from "./drawers";

interface DrawerRendererProps<D extends types.DrawerId> {
  readonly id: D;
  readonly props: types.DrawerDynamicProps<D>;
  readonly onClose: () => void;
}

export const DrawerRenderer = <D extends types.DrawerId>({
  id,
  props,
  onClose,
}: DrawerRendererProps<D>) => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const Drawer = getDrawerComponent(id) as React.ComponentType<any>;
  const ps = {
    ...props,
    onClose,
  } as React.ComponentProps<typeof Drawer>;

  return (
    <DrawerContainer>
      <Drawer {...ps} />
    </DrawerContainer>
  );
};

export default DrawerRenderer;
