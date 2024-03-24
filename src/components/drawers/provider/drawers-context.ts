import { createContext } from "react";

import { type DrawersManager } from "./use-drawers-manager";

export const DrawersContext = createContext<DrawersManager>({
  drawer: null,
  isReady: false,
  openId: null,
  open: () => {},
  close: () => {},
});
