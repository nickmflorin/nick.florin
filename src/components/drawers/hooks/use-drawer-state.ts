import { useState, useEffect } from "react";

import isEqual from "lodash.isequal";

import { subscribe, unsubscribe } from "~/events/drawer-state-change-event";
import { type DrawerDynamicProps } from "~/components/drawers/provider/drawers";

export interface DrawerStateOptions<D extends DrawerId> {
  drawerId: D;
  props: DrawerDynamicProps<D>;
}

/**
 * A hook that provides the means of managing the state of a drawer locally to the component,
 * with a dynamically loaded and conditionally rendered {@link ClientDrawer} component, rather
 * than declaratively through the {@link DrawerProvider} directly.
 *
 * Managing the open/closed state of a drawer can be done via the {@link DrawerProvider} directly,
 * and declaratively, as follows:
 *
 * ```tsx
 * import { useDrawers } from "~/components/drawers/hooks/use-drawers";
 *
 * const MyComponent = () => {
 *   const { open } = useDrawers();
 *
 *   return (
 *     <Button onClick={() => open("my-drawer-id", { my: "props" })}>
 *       Open Drawer
 *     </Button>
 *   );
 * }
 * ```
 *
 * The problem with this, however, is that it requires us to import the 'useDrawers' hook, and all
 * of its associated mechanical, client-side only logic, into the component that needs to open the
 * drawer, regardless of whether or not the drawer is opened.
 *
 * This is not ideal - but, to offer a more reactive approach, this hook - when used in conjunction
 * with the {@link ClientDrawer} component, can be used to dynamically render a drawer component
 * when the drawer is opened, and to manage the state of the drawer locally to the component:
 *
 * ```tsx
 * import { useDrawerState } from "~/components/drawers/hooks/use-drawer-state";
 *
 * const ClientDrawer = dynamic(() => import("~/components/drawers/ClientDrawer"), {});
 *
 * const MyComponent = () => {
 *   const { isOpen, open } = useDrawerState({ drawerId: "my-drawer-id" });
 *
 *   return (
 *     <>
 *       <Button onClick={() => open()}>
 *       {isOpen && (
 *         <ClientDrawer id="my-drawer-id" props={{ my: "props" }} />
 *        )}
 *     </>
 *   )
 * }
 * ```
 */
export const useDrawerState = <D extends DrawerId>({ drawerId, props }: DrawerStateOptions<D>) => {
  const [state, setState] = useState<DrawerState>("closed");

  useEffect(() => {
    const handler = (e: DrawerStateChangeEvent) => {
      if (e.detail.state === "opened") {
        if (e.detail.id === drawerId && isEqual(e.detail.props, props)) {
          setState("opened");
        }
      } else if (e.detail.id !== undefined) {
        if (e.detail.id === drawerId) {
          setState("closed");
        }
      } else {
        setState("closed");
      }
    };
    subscribe(handler);
    return () => {
      unsubscribe(handler);
    };
  }, [drawerId, props]);

  /* Note: The 'open' method here is not actually what opens the drawer.  The 'open' method is
     simply used to set the open state locally (and eagerly) to trigger the rendering of the
     <ClientDrawer /> inside the component locally.  It is not until the <ClientDrawer /> is
     rendered, that the "true" open state is set.  However, the events are used to keep the true
     open/closed state in sync with the local state here - so that the local state is also updated
     when the drawer is closed, allowing the locally managed <ClientDrawer /> to be reopened (and
     rerendered). */
  return { state, isOpen: state === "opened", open: () => setState("opened") };
};
