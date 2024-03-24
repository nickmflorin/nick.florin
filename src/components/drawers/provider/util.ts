import type * as types from "./types";

export const Drawer = <
  D extends types.DrawerId,
  P extends types.WithInjectedDrawerProps<D>,
  C extends React.ComponentType<P>,
>(
  id: D,
  component: C,
) => ({
  id,
  component,
});
