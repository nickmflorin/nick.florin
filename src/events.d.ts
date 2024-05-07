declare global {
  type DrawerState = "opened" | "closed";

  type DrawerStateChangeEventDetail = { state: DrawerState };

  type DrawerStateChangeEvent = CustomEvent<DrawerStateChangeEventDetail>;

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
