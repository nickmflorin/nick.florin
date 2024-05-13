import { DrawerContainer } from "../DrawerContainer";

import { type DrawerDynamicProps } from "./drawers";
import { getDrawerComponent } from "./drawers";

interface DrawerRendererProps<D extends DrawerId> {
  readonly id: D;
  readonly onClose: () => void;
  readonly props: DrawerDynamicProps<D>;
}

export const DrawerRenderer = <D extends DrawerId>({
  id,
  props,
  onClose,
}: DrawerRendererProps<D>) => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const Drawer = getDrawerComponent(id) as React.ComponentType<any>;
  const ps = { ...props, onClose } as React.ComponentProps<typeof Drawer>;

  return (
    <DrawerContainer>
      <Drawer {...ps} />
    </DrawerContainer>
  );
};

export default DrawerRenderer;
