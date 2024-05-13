import type { EnumeratedLiteralsType } from "~/lib/literals";
import { type DrawerDynamicProps } from "~/components/drawers/provider/drawers";
import type { TypeOfDrawerIds } from "~/components/drawers/provider/types";

declare global {
  type DrawerState = "opened" | "closed";

  type DrawerId = EnumeratedLiteralsType<TypeOfDrawerIds>;

  type DrawerStateOpenedEventDetail<D extends DrawerId = DrawerId> = D extends DrawerId
    ? { id: D; state: "opened"; props: DrawerDynamicProps<D> }
    : never;

  type DrawerStateClosedEventDetail = { id?: DrawerId; state: "closed" };

  type DrawerStateChangeEventDetail<D extends DrawerId = DrawerId> =
    | DrawerStateOpenedEventDetail<D>
    | DrawerStateClosedEventDetail;

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
