import type { EnumeratedLiteralsMember } from "enumerated-literals";

import { type DrawerDynamicProps } from "~/components/drawers/provider/drawers";
import type { TypeOfDrawerIds } from "~/components/drawers/provider/types";

declare global {
  type DrawerState = "opened" | "closed";

  type DrawerId = EnumeratedLiteralsMember<TypeOfDrawerIds>;

  type DrawerStateOpenedEventDetail<D extends DrawerId = DrawerId> = {
    id: D;
    state: "opened";
    props: DrawerDynamicProps<D>;
  };

  type DrawerStateClosedEventDetail<D extends DrawerId = DrawerId> = {
    id?: D;
    state: "closed";
    props?: never;
  };

  type DrawerStateChangeEventDetail<D extends DrawerId = DrawerId> =
    | DrawerStateOpenedEventDetail<D>
    | DrawerStateClosedEventDetail<D>;

  type DrawerStateChangeEvent<D extends DrawerId = DrawerId> = CustomEvent<
    DrawerStateChangeEventDetail<D>
  >;

  interface CustomEventMap {
    drawerStateChanged: DrawerStateChangeEvent;
  }

  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void;
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void;
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
  }
}

export {};
